#!/usr/bin/env node

import { Command } from 'commander';
import { generateTestFiles } from '.';
import { exitWithMessage } from '../utils';
import { loadConfig as loadPlaywrightConfig } from '../playwright/loadConfig';
import { getEnvConfigs } from '../config/env';

const program = new Command();

program
  .name('bddgen')
  .description('Generate Playwright tests from Gherkin documents')
  .option(
    '-c, --config <file>',
    `Path to Playwright configuration file. Default: playwright.config.(js|ts)`,
  )
  .action(async (opts) => {
    await loadPlaywrightConfig(opts.config);
    const configs = Object.values(getEnvConfigs());
    assertConfigsExist(configs);
    for (const config of configs) {
      await generateTestFiles(config);
    }
  });

program.parse();

function assertConfigsExist(configs: unknown[]) {
  if (configs.length === 0) {
    exitWithMessage(`No BDD configs found. Did you use defineBddConfig() in playwright.config.ts?`);
  }
}
