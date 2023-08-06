import { Worker } from 'node:worker_threads';
import { once } from 'node:events';
import path from 'node:path';
import { Command } from 'commander';
import { TestFilesGenerator } from '../gen';
import { exitWithMessage } from '../utils';
import { loadConfig as loadPlaywrightConfig } from '../playwright/loadConfig';
import { getEnvConfigs } from '../config/env';
import { BDDConfig, defaults } from '../config';
import { configOption } from './configOption';

const GEN_WORKER_PATH = path.resolve(__dirname, '..', 'gen', 'worker.js');

export const testsCommand = new Command('tests')
  .description('Generate Playwright tests from Gherkin documents')
  .addOption(configOption)
  .option('--tags', `Tags expression to filter scenarios`)
  .option('--verbose', `Verbose mode (default: ${Boolean(defaults.verbose)})`)
  .action(async (opts) => {
    await loadPlaywrightConfig(opts.config);
    const configs = Object.values(getEnvConfigs());
    const cliOptions = buildCliOptions(opts);
    await generateFilesForConfigs(configs, cliOptions);
  });

function buildCliOptions(opts: { verbose?: boolean }) {
  const config: Partial<BDDConfig> = {};
  if ('verbose' in opts) config.verbose = Boolean(opts.verbose);
  return config;
}

function assertConfigsCount(configs: unknown[]) {
  if (configs.length === 0) {
    exitWithMessage(`No BDD configs found. Did you use defineBddConfig() in playwright.config.ts?`);
  }
}

async function generateFilesForConfigs(configs: BDDConfig[], cliConfig: Partial<BDDConfig>) {
  assertConfigsCount(configs);
  // run first config in main thread and other in workers (to have fresh require cache)
  // See: https://github.com/vitalets/playwright-bdd/issues/32
  const tasks = configs.map((config, index) => {
    const finalConfig = { ...config, ...cliConfig };
    return index === 0 ? new TestFilesGenerator(finalConfig).generate() : runInWorker(finalConfig);
  });

  return Promise.all(tasks);
}

async function runInWorker(config: BDDConfig) {
  const worker = new Worker(GEN_WORKER_PATH, {
    workerData: { config },
  });

  // todo: check if worker exited with error?
  await once(worker, 'exit');
}
