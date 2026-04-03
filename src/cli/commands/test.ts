import { Worker } from 'node:worker_threads';
import { once } from 'node:events';
import os from 'node:os';
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

const GEN_WORKER_PATH = path.resolve(__dirname, '..', 'worker.js');

type TestCommandOptions = ConfigOption & {
  tags?: string;
  verbose?: string;
};

export const testCommand = new Command('test')
  .description('Generate Playwright test files from Gherkin documents')
  .configureHelp({ showGlobalOptions: true })
  .option('--tags <expression>', `Tags expression to filter scenarios for generation`)
  .option('--verbose', `Verbose mode (default: ${Boolean(defaults.verbose)})`)
  .action(async () => {
    const opts = testCommand.optsWithGlobals<TestCommandOptions>();
    setBddGenPhase();
    await loadPlaywrightConfig(opts.config);
    const configs = readConfigsFromEnv();
    mergeCliOptions(configs, opts);
    const isVerbose = hasVerboseFlag(configs);

    await generateFilesForConfigs(configs);

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

async function generateFilesForConfigs(configs: BDDConfig[]) {
  // run first config in main thread and other in workers (to have fresh require cache)
  // See: https://github.com/vitalets/playwright-bdd/issues/32
  const [firstConfig, ...restConfigs] = configs;
  await new TestFilesGenerator(firstConfig!).generate();
  if (restConfigs.length > 0) {
    await pMap(restConfigs, runInWorker, getMaxWorkers());
  }
}

function getMaxWorkers() {
  // Use os.availableParallelism (Node 18.14+) with fallback to os.cpus().
  // Cap at half the available CPUs to avoid OOM in memory-constrained CI environments.
  return Math.max(1, Math.floor((os.availableParallelism?.() ?? os.cpus().length) / 2));
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
