import { Worker } from 'node:worker_threads';
import { once } from 'node:events';
import path from 'node:path';
import { Command } from 'commander';
import { TestFilesGenerator } from '../../generate';
import { loadConfig as loadPlaywrightConfig } from '../../playwright/loadConfig';
import { getEnvConfigs } from '../../config/env';
import { ConfigOption } from '../options';
import { exit } from '../../utils/exit';
import { BDDConfig } from '../../config/types';
import { defaults } from '../../config/defaults';
import { setBddGenPhase } from '../helpers/bddgenPhase';
import { showWarnings } from '../../config/warnings';
import { pMap } from '../../utils/p-map';
import { Logger } from '../../utils/logger';
import { WatchController } from '../watch/parent';
import {
  isWatchModeChild,
  sendWatchMetadataToParent,
  waitForStartGenerationMessage,
} from '../watch/ipc';
import { withGenerationLock } from '../../lock-file/generation';

const GEN_WORKER_PATH = path.resolve(__dirname, '..', 'worker.js');

type TestCommandOptions = ConfigOption & {
  tags?: string;
  verbose?: string;
  watch?: boolean;
};

export const testCommand = new Command('test')
  .description('Generate Playwright test files from Gherkin documents')
  .configureHelp({ showGlobalOptions: true })
  .option('--tags <expression>', `Tags expression to filter scenarios for generation`)
  .option('--verbose', `Verbose mode (default: ${Boolean(defaults.verbose)})`)
  .option('--watch', `Watch mode (default: false)`)
  // eslint-disable-next-line max-statements
  .action(async () => {
    const opts = testCommand.optsWithGlobals<TestCommandOptions>();
    // In watch mode the parent process is long-lived and should not generate files itself.
    // Instead, it spawns a child process to generate files and send watch metadata back to the parent.
    if (opts.watch) {
      await new WatchController().run();
      return;
    }

    setBddGenPhase();
    const { resolvedConfigFile } = await loadPlaywrightConfig(opts.config);
    const configs = readConfigsFromEnv();
    mergeCliOptions(configs, opts);
    if (isWatchModeChild()) {
      sendWatchMetadataToParent(configs, resolvedConfigFile);
    }
    const isVerbose = hasVerboseFlag(configs);

    await generateFilesWithOptionalLock(configs);

    if (isVerbose) printDone();
  });

function readConfigsFromEnv() {
  const configs: BDDConfig[] = Object.values(getEnvConfigs());
  assertConfigsCount(configs);
  showWarnings(configs);
  return configs;
}

function mergeCliOptions(configs: BDDConfig[], opts: TestCommandOptions) {
  configs.forEach((config) => {
    if ('tags' in opts) config.tags = opts.tags;
    if ('verbose' in opts) config.verbose = Boolean(opts.verbose);
  });
}

export function assertConfigsCount(configs: unknown[]) {
  if (configs.length === 0) {
    exit(`No BDD configs found. Did you use defineBddConfig() in playwright.config.ts?`);
  }
}

async function generateFilesWithOptionalLock(configs: BDDConfig[]) {
  const [configsWithLockFileEnabled, configsWithLockFileDisabled] =
    splitConfigsByLockfileEnabled(configs);

  if (configsWithLockFileDisabled.length > 0) {
    if (isWatchModeChild()) await waitForStartGenerationMessage();
    await generateFilesForConfigs(configsWithLockFileDisabled, true);
  }

  if (configsWithLockFileEnabled.length === 0) return;

  await withGenerationLock(
    configsWithLockFileEnabled.map((config) => config.outputDir),
    async () => {
      // For fully locked projects, changes should keep coalescing until active tests finish.
      if (isWatchModeChild() && configsWithLockFileDisabled.length === 0) {
        await waitForStartGenerationMessage();
      }
      await generateFilesForConfigs(
        configsWithLockFileEnabled,
        configsWithLockFileDisabled.length === 0,
      );
    },
  );
}

function splitConfigsByLockfileEnabled(configs: BDDConfig[]) {
  const configsWithLockFileEnabled: BDDConfig[] = [];
  const configsWithLockFileDisabled: BDDConfig[] = [];
  configs.forEach((config) => {
    const target = config.lockFile ? configsWithLockFileEnabled : configsWithLockFileDisabled;
    target.push(config);
  });
  return [configsWithLockFileEnabled, configsWithLockFileDisabled] as const;
}

async function generateFilesForConfigs(configs: BDDConfig[], runFirstConfigInMainThread: boolean) {
  // Run one config in the main thread. Every other config needs a fresh require cache,
  // including when lock-enabled and lock-disabled configs are generated separately.
  // See: https://github.com/vitalets/playwright-bdd/issues/32
  const firstConfig = configs[0];
  if (!firstConfig) return;
  const restConfigs = configs.slice(1);
  if (runFirstConfigInMainThread) {
    await new TestFilesGenerator(firstConfig).generate();
  }
  const configsForWorkers = runFirstConfigInMainThread ? restConfigs : configs;
  if (configsForWorkers.length > 0) {
    // bddgen uses Playwright's requireOrImport() to load TS/JS step files. This helper transforms
    // modules through Playwright's shared disk cache. Here, we generate configs sequentially (concurrency=1)
    // because Playwright opens a cache file for writing before writing its content, allowing another
    // worker to read the empty file and import an empty step module.
    await pMap(configsForWorkers, runInWorker, 1);
  }
}

async function runInWorker(config: BDDConfig) {
  const worker = new Worker(GEN_WORKER_PATH, {
    workerData: { config },
  });

  const [exitCode] = await once(worker, 'exit');
  if (exitCode) exit();
}

function hasVerboseFlag(configs: BDDConfig[]) {
  return configs.some((config) => config.verbose);
}

function printDone() {
  const logger = new Logger({ verbose: true });
  const duration = process.uptime().toFixed(1);
  logger.log(`Done (${duration}s).`);
}
