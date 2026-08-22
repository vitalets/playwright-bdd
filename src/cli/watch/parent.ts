import path from 'node:path';
import { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import type { Stats } from 'node:fs';
import chokidar, { FSWatcher } from 'chokidar';
import { areWatchPathsEqual, resolveWatchPaths } from './paths';
import { WatchChildMessage, WatchMetadata, StartGenerationMessage } from './ipc';
import { logger } from '../../utils/logger';
import { isPathInside, relativeToCwd } from '../../utils/paths';
import { isWatchedFile } from './fileFilter';
import { forkWatchChild } from './child';
import { isIgnoredByGitIgnore } from './gitIgnore';

const ALWAYS_IGNORED = new Set(['.git', 'node_modules', 'test-results', 'playwright-report']);
const DEBOUNCE_MS = 100;
type WatchPaths = ReturnType<typeof resolveWatchPaths>;

export class WatchController {
  private activeChild?: ChildProcess;
  private changedFiles = new Set<string>();
  private closePromise?: Promise<void>;
  private debounceTimer?: NodeJS.Timeout;
  private dirty = false;
  private generationStarted = false;
  private resolvedConfigFile?: string;
  private resolveRun?: () => void;
  private watchPaths?: WatchPaths;
  private watcher?: FSWatcher;
  private watcherUpdate?: Promise<boolean>;

  async run() {
    process.once('SIGINT', this.handleSignal);
    process.once('SIGTERM', this.handleSignal);
    await new Promise<void>((resolve) => {
      // Register the resolver before forking in case the child exits immediately.
      this.resolveRun = resolve;
      this.startRebuild(true);
    });
  }

  private startRebuild(isInitial = false) {
    if (!isInitial) this.logDetectedChanges();
    this.watcherUpdate = undefined;
    this.generationStarted = false;
    const child = forkWatchChild();
    this.activeChild = child;
    child.on('message', (message: WatchChildMessage) => {
      if (message?.type === 'metadata') this.handleMetadataMessage(message.metadata);
      if (message?.type === 'ready-to-generate') void this.startChildGeneration(child);
    });
    child.once('exit', (exitCode) => void this.handleRebuildExit(child, exitCode));
  }

  private handleMetadataMessage(metadata: WatchMetadata) {
    // Config can change between runs, so refresh watch paths from every child.
    this.resolvedConfigFile = metadata.resolvedConfigFile;
    this.watcherUpdate = this.updateWatcher(metadata).then(
      () => true,
      (error) => {
        logger.error('Failed to update watched paths:', error);
        return false;
      },
    );
  }

  private async updateWatcher(metadata: WatchMetadata) {
    const nextWatchPaths = resolveWatchPaths(metadata);
    if (areWatchPathsEqual(this.watchPaths, nextWatchPaths)) return;

    this.watchPaths = nextWatchPaths;
    const previousWatcher = this.watcher;
    this.watcher = undefined;
    await previousWatcher?.close();
    if (this.closePromise) return;
    this.watcher = this.createWatcher(nextWatchPaths);
    await once(this.watcher, 'ready');
    this.logWatchRoots(nextWatchPaths.roots);
  }

  private createWatcher(watchPaths: WatchPaths) {
    const watcher = chokidar.watch(watchPaths.roots, {
      ignoreInitial: true,
      ignored: (filePath, stats) => this.isIgnored(filePath, stats),
    });
    let isReady = false;
    watcher.on('add', (filePath) => this.handleFileChange(filePath));
    watcher.on('change', (filePath) => this.handleFileChange(filePath));
    watcher.on('unlink', (filePath) => this.handleFileChange(filePath));
    watcher.once('ready', () => (isReady = true));
    // Attach before initialization finishes, but let updateWatcher report startup errors once.
    watcher.on('error', (error) => {
      if (isReady) logger.error('Watch error:', error);
    });
    return watcher;
  }

  private logWatchRoots(roots: string[]) {
    logger.warn('Watching for changes in:');
    roots.forEach((root) => logger.warn(`- ${root}`));
  }

  private isIgnored(filePath: string, stats?: Stats) {
    const absolutePath = path.resolve(filePath);
    if (absolutePath.split(path.sep).some((part) => ALWAYS_IGNORED.has(part))) return true;
    if (!this.watchPaths) return false;
    return (
      this.watchPaths.ignoredPaths.some((ignoredPath) => isPathInside(ignoredPath, absolutePath)) ||
      isIgnoredByGitIgnore(this.watchPaths.gitIgnores, absolutePath, stats)
    );
  }

  private handleFileChange(filePath: string) {
    if (
      this.watchPaths &&
      isWatchedFile(filePath, this.watchPaths.extensions, this.watchPaths.directFilesToWatch)
    ) {
      this.scheduleRebuild(filePath);
    }
  }

  private scheduleRebuild(changedFile?: string) {
    if (this.closePromise) return;
    if (changedFile) this.changedFiles.add(path.resolve(changedFile));
    if (this.activeChild) return this.handleChangeDuringGeneration(changedFile);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = undefined;
      this.startRebuild();
    }, DEBOUNCE_MS);
  }

  private handleChangeDuringGeneration(changedFile?: string) {
    if (this.generationStarted || this.isConfigFile(changedFile)) this.dirty = true;
  }

  private async startChildGeneration(child: ChildProcess) {
    const watcherReady = (await this.watcherUpdate) ?? true;
    if (!watcherReady) return this.handleWatcherUpdateFailure();
    if (this.activeChild !== child || this.closePromise) return;
    this.generationStarted = true;
    this.changedFiles.clear();
    child.send({ type: 'start-generation' } satisfies StartGenerationMessage);
  }

  private isConfigFile(changedFile?: string) {
    return changedFile !== undefined && path.resolve(changedFile) === this.resolvedConfigFile;
  }

  private async handleWatcherUpdateFailure() {
    process.exitCode = 1;
    await this.close();
  }

  private logDetectedChanges() {
    const [firstFile] = this.changedFiles;
    const remainingCount = this.changedFiles.size - 1;
    this.changedFiles.clear();
    const remaining = remainingCount > 0 ? ` (+${remainingCount} more)` : '';
    logger.warn(
      firstFile ? `Changes detected: ${relativeToCwd(firstFile)}${remaining}` : 'Changes detected.',
    );
    logger.warn('Regenerating...');
  }

  private async handleRebuildExit(child: ChildProcess, exitCode: number | null) {
    if (this.activeChild !== child) return;
    if (!(await this.waitForWatcherUpdate())) return;
    this.activeChild = undefined;
    if (this.closePromise) return;

    if (!this.watcher) {
      this.handleInitialFailure(exitCode);
      return;
    }

    this.logRebuildResult(exitCode);
    this.scheduleDirtyRebuild();
  }

  private async waitForWatcherUpdate() {
    const succeeded = (await this.watcherUpdate) ?? true;
    this.watcherUpdate = undefined;
    if (succeeded) return true;
    process.exitCode = 1;
    await this.close();
    return false;
  }

  private scheduleDirtyRebuild() {
    if (!this.dirty) return;
    this.dirty = false;
    this.scheduleRebuild();
  }

  private handleInitialFailure(exitCode: number | null) {
    process.exitCode = exitCode || 1;
    this.finish();
  }

  private logRebuildResult(exitCode: number | null) {
    const message = exitCode
      ? 'Generation failed. Waiting for changes...'
      : 'Generation completed. Waiting for changes...';
    if (exitCode) return logger.error(message);
    logger.warn(message);
  }

  private handleSignal = () => void this.close();

  private close() {
    if (!this.closePromise) {
      this.closePromise = (async () => {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.activeChild?.kill('SIGTERM');
        await this.watcher?.close();
        logger.warn('Watch mode stopped.');
        this.finish();
      })();
    }
    return this.closePromise;
  }

  private finish() {
    process.removeListener('SIGINT', this.handleSignal);
    process.removeListener('SIGTERM', this.handleSignal);
    this.resolveRun?.();
  }
}
