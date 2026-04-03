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
import { Logger } from '../../utils/logger';

const GEN_WORKER_PATH = path.resolve(__dirname, '..', 'worker.js');
const DEFAULT_WORKERS = Math.max(1, Math.floor((os.availableParallelism?.() ?? os.cpus().length) / 2));

type TestCommandOptions = ConfigOption & {
  tags?: string;
  verbose?: string;
  workers?: string;
};

export const testCommand = new Command('test')
  .description('Generate Playwright test files from Gherkin documents')
  .configureHelp({ showGlobalOptions: true })
  .option('--tags <expression>', `Tags expression to filter scenarios for generation`)
  .option('--verbose', `Verbose mode (default: ${Boolean(defaults.verbose)})`)
  .option('--workers <number>', `Max parallel worker threads for generation (default: ${DEFAULT_WORKERS})`)
  .action(async () => {
    const opts = testCommand.optsWithGlobals<TestCommandOptions>();
    setBddGenPhase();
    await loadPlaywrightConfig(opts.config);
    const configs = readConfigsFromEnv();
    mergeCliOptions(configs, opts);
    const isVerbose = hasVerboseFlag(configs);
    const workers = parseWorkers(opts.workers);

    await generateFilesForConfigs(configs, workers);

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

async function generateFilesForConfigs(configs: BDDConfig[], concurrency: number) {
  // run first config in main thread and other in workers (to have fresh require cache)
  // See: https://github.com/vitalets/playwright-bdd/issues/32
  const { default: pMap } = await import('p-map');
  const [firstConfig, ...restConfigs] = configs;
  await new TestFilesGenerator(firstConfig!).generate();
  if (restConfigs.length > 0) {
    await pMap(restConfigs, (config) => runInWorker(config), { concurrency });
  }
}

function parseWorkers(value: string | undefined): number {
  if (value === undefined) return DEFAULT_WORKERS;
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1) {
    exit(`Invalid --workers value: "${value}". Must be a positive integer.`);
  }
  return n;
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
