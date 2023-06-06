#!/usr/bin/env node

import { Command } from 'commander';
import { generateBDDFilesImpl } from '.';
import { BDDInputConfig, defaults } from '../config';

const program = new Command();

program
  .name('bddgen')
  .description('Generate Playwright tests from Gherkin documents')
  // don't use .option default value as defaults applied later in config module
  .option('-o, --output <dir>', `Output dir (default: "${defaults.outputDir}")`)
  .option(
    '-t, --import-test-from <file>',
    `Path to file for importing test instance (default: "playwright-bdd")`,
  )
  .option('--verbose', `Verbose mode (default: false)`)
  .action(async ({ output, importTestFrom, verbose }) => {
    const inputConfig: BDDInputConfig = {};
    if (output) inputConfig.outputDir = output;
    if (importTestFrom) inputConfig.importTestFrom = importTestFrom;
    if (verbose) inputConfig.verbose = verbose;
    await generateBDDFilesImpl(inputConfig);
  });

program.parse();
