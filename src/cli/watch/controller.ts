import path from 'node:path';
import { ChildProcess, fork } from 'node:child_process';
import { once } from 'node:events';
import chokidar, { FSWatcher } from 'chokidar';
import { resolveWatchPaths } from './paths';
import { WATCH_CHILD_ENV, WatchMetadata, WatchMetadataMessage } from './ipc';
import { logger } from '../../utils/logger';
import { isPathInside, relativeToCwd } from '../../utils/paths';

const DEBOUNCE_MS = 100;
const CLI_PATH = path.resolve(__dirname, '..', 'index.js');

type WatchPaths = ReturnType<typeof resolveWatchPaths>;

export class WatchController {
  private activeChild?: ChildProcess;
  private closePromise?: Promise<void>;
  private debounceTimer?: NodeJS.Timeout;
  private dirty = false;
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
    if (!isInitial) logger.warn('Changes detected. Regenerating...');
    this.watcherUpdate = undefined;
    const child = fork(CLI_PATH, this.getChildArgs(), {
      env: this.getRebuildEnv(),
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    });
    this.activeChild = child;
    child.on('message', (message: WatchMetadataMessage) => {
      if (message?.type === 'metadata') {
        // Config can change between runs, so refresh watch paths from every child.
        this.watcherUpdate = this.updateWatcher(message.metadata).then(
          () => true,
          (error) => {
            logger.error('Failed to update watched paths:', error);
            return false;
          },
        );
      }
    });
    child.once('exit', (exitCode) => void this.handleRebuildExit(child, exitCode));
  }

  private getChildArgs() {
    return process.argv.slice(2).filter((arg) => arg !== '--watch');
  }

  private getRebuildEnv() {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      [WATCH_CHILD_ENV]: '1',
    };
    delete env.PLAYWRIGHT_BDD_CONFIGS;
    return env;
  }

  private async updateWatcher(metadata: WatchMetadata) {
    const nextWatchPaths = resolveWatchPaths(metadata);
    if (this.hasSameWatchPaths(nextWatchPaths)) return;

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
      ignored: (filePath) => this.isIgnored(filePath),
    });
    let isReady = false;
    watcher.on('all', () => this.scheduleRebuild());
    watcher.once('ready', () => (isReady = true));
    // Attach before initialization finishes, but let updateWatcher report startup errors once.
    watcher.on('error', (error) => {
      if (isReady) logger.error('Watch error:', error);
    });
    return watcher;
  }

  private logWatchRoots(roots: string[]) {
    const relativeRoots = roots.map((root) => relativeToCwd(root) || '.');
    if (relativeRoots.length === 1) {
      logger.warn(`Watching for changes in: ${relativeRoots[0]}`);
      return;
    }
    logger.warn('Watching for changes in:');
    relativeRoots.forEach((root) => logger.warn(`  - ${root}`));
  }

  private hasSameWatchPaths(nextWatchPaths: WatchPaths) {
    return (
      this.watchPaths?.roots.join('\0') === nextWatchPaths.roots.join('\0') &&
      this.watchPaths.ignoredPaths.join('\0') === nextWatchPaths.ignoredPaths.join('\0')
    );
  }

  private isIgnored(filePath: string) {
    const absolutePath = path.resolve(filePath);
    const pathParts = absolutePath.split(path.sep);
    if (pathParts.includes('.git') || pathParts.includes('node_modules')) return true;
    return Boolean(
      this.watchPaths?.ignoredPaths.some((ignoredPath) => isPathInside(ignoredPath, absolutePath)),
    );
  }

  private scheduleRebuild() {
    if (this.closePromise) return;
    if (this.activeChild) {
      this.dirty = true;
      return;
    }
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = undefined;
      this.startRebuild();
    }, DEBOUNCE_MS);
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
    if (exitCode) {
      logger.error(message);
    } else {
      logger.warn(message);
    }
  }

  private handleSignal = () => {
    void this.close();
  };

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
