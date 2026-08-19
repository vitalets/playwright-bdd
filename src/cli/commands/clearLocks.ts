import path from 'node:path';
import { Command } from 'commander';
import { getEnvConfigs } from '../../config/env';
import { clearLockFiles } from '../../lock-file';
import { loadConfig as loadPlaywrightConfig } from '../../playwright/loadConfig';
import { removeDuplicates } from '../../utils';
import { Logger } from '../../utils/logger';
import { ConfigOption } from '../options';
import { assertConfigsCount } from './test';

const logger = new Logger({ verbose: true });

type ClearLocksCommandOptions = ConfigOption;

export const clearLocksCommand = new Command('clear-locks')
  .description('Clears lock files for the current project')
  .configureHelp({ showGlobalOptions: true })
  .action(async () => {
    const opts = clearLocksCommand.optsWithGlobals<ClearLocksCommandOptions>();
    const { resolvedConfigFile } = await loadPlaywrightConfig(opts.config);
    logger.log(`Using config: ${path.relative(process.cwd(), resolvedConfigFile)}`);
    const configs = Object.values(getEnvConfigs());
    assertConfigsCount(configs);
    const outputDirs = removeDuplicates(configs.map((config) => config.outputDir));
    const clearedLocks = await clearLockFiles(outputDirs);
    showActiveLockWarnings(clearedLocks);
    showClearedOutputDirs(outputDirs);
  });

function showClearedOutputDirs(outputDirs: string[]) {
  logger.log(
    ['Cleared lock files for BDD output directories:', ...outputDirs.map((dir) => `- ${dir}`)].join(
      '\n',
    ),
  );
}

function showActiveLockWarnings(clearedLocks: Awaited<ReturnType<typeof clearLockFiles>>) {
  clearedLocks
    .filter((lock) => lock.wasActive)
    .forEach((lock) => {
      const lockName = path.basename(lock.lockPath);
      logger.warn(`Warning: removed active lock ${lockName} owned by PID ${lock.owner?.pid}.`);
    });
}
