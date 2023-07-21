#!/usr/bin/env node

import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { once } from 'node:events';
import { Command } from 'commander';
import { generateTestFiles } from '.';
import { exitWithMessage } from '../utils';
import { loadConfig as loadPlaywrightConfig } from '../playwright/loadConfig';
import { getEnvConfigs } from '../config/env';
import { BDDConfig, defaults } from '../config';

const program = new Command();

program
  .name('bddgen')
  .description('Generate Playwright tests from Gherkin documents')
  .option(
    '-c, --config <file>',
    `Path to Playwright configuration file (default: playwright.config.(js|ts))`,
  )
  .option('--verbose', `Verbose mode (default: ${Boolean(defaults.verbose)})`)
  .action(async (opts) => {
    await loadPlaywrightConfig(opts.config);
    const configs = Object.values(getEnvConfigs());
    const cliConfig = buildCliConfig(opts);
    await generateFilesForConfigs(configs, cliConfig);
  });

program.parse();

function buildCliConfig(opts: { verbose?: boolean }) {
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
    return index === 0 ? generateTestFiles(finalConfig) : runInWorker(finalConfig);
  });

  return Promise.all(tasks);
}

async function runInWorker(config: BDDConfig) {
  const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
    workerData: { config },
  });

  await once(worker, 'exit');
}
