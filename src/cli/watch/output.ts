import { styleText } from 'node:util';
import { performance } from 'node:perf_hooks';
import { getPackageVersion } from '../../utils';
import { logger } from '../../utils/logger';
import { relativeToCwd } from '../../utils/paths';

/** Append-only output keeps child diagnostics and user console messages intact. */
export class WatchOutput {
  private startedAt = 0;
  private initial = true;

  start(changedFiles: Set<string>, initial: boolean) {
    this.startedAt = performance.now();
    this.initial = initial;
    if (initial) {
      const title = styleText(['bold', 'cyan'], 'bddgen');
      const version = styleText('dim', `v${getPackageVersion('playwright-bdd')}`);
      logger.warn(`\n  ${title} ${version}  ${styleText('dim', 'watch mode')}\n`);
      return;
    }
    const [firstFile] = changedFiles;
    const remaining = changedFiles.size - 1;
    const suffix = remaining > 0 ? styleText('dim', ` (+${remaining} more)`) : '';
    this.event(
      firstFile
        ? `changed ${styleText('cyan', relativeToCwd(firstFile))}${suffix}`
        : 'regenerating',
    );
  }

  paths(configFile: string, roots: string[]) {
    this.detail('Config:', relativeToCwd(configFile));
    const paths = roots.map((root) => relativeToCwd(root) || '.');
    const remaining = paths.length - 3;
    const suffix = remaining > 0 ? ` (+${remaining} more)` : '';
    this.detail('Watch:', paths.slice(0, 3).join(', ') + suffix);
  }

  complete(exitCode: number | null, signal: NodeJS.Signals | null, queued: boolean) {
    if (exitCode !== 0) return this.failed(signal, queued);
    const pending = queued ? styleText('yellow', 'changes queued') : '';
    // Include child startup, config loading, and lock waits in the elapsed time.
    const duration = styleText('bold', `${Math.round(performance.now() - this.startedAt)} ms`);
    if (this.initial) return this.ready(duration, pending);
    this.event(
      `${styleText('green', 'generated')} in ${duration}${pending ? `; ${pending}` : ''}`,
      'green',
    );
  }

  stopped() {
    this.event(styleText('dim', 'watch mode stopped'));
  }

  private ready(duration: string, pending: string) {
    const status = pending || styleText('dim', 'Watching for changes.');
    logger.warn(`  ${styleText('green', '➜ Ready')} in ${duration}. ${status}`);
    logger.warn(`  ${styleText('dim', '➜ Ctrl+C to stop')}\n`);
  }

  private failed(signal: NodeJS.Signals | null, queued: boolean) {
    const options = { stream: process.stderr };
    const reason = signal ? `generation interrupted (${signal})` : 'generation failed';
    const pending = queued
      ? styleText('yellow', 'changes queued', options)
      : styleText('dim', 'watching for changes', options);
    this.event(`${styleText('red', reason, options)}; ${pending}`, 'red');
  }

  private detail(label: string, value: string) {
    logger.warn(`  ${styleText('cyan', '➜')} ${styleText('bold', label.padEnd(8))} ${value}`);
  }

  private event(message: string, tone: 'cyan' | 'green' | 'red' = 'cyan') {
    const failed = tone === 'red';
    const stream = failed ? process.stderr : process.stdout;
    const time = new Date().toTimeString().slice(0, 8);
    const prefix = styleText(tone, '[bddgen]', { stream });
    const line = `  ${styleText('dim', time, { stream })} ${prefix} ${message}`;
    if (failed) logger.error(line);
    else logger.warn(line);
  }
}
