#!/usr/bin/env node

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
    assertConfigsExist(configs);
    const cliConfig = buildCliConfig(opts);
    for (const config of configs) {
      await generateTestFiles({ ...config, ...cliConfig });
    }
  });

program.parse();

function buildCliConfig(opts: { verbose?: boolean }) {
  const config: Partial<BDDConfig> = {};
  if ('verbose' in opts) config.verbose = Boolean(opts.verbose);
  return config;
}

function assertConfigsExist(configs: unknown[]) {
  if (configs.length === 0) {
    exitWithMessage(`No BDD configs found. Did you use defineBddConfig() in playwright.config.ts?`);
  }
}
