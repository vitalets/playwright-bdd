#!/usr/bin/env node

import { Command } from 'commander';
import { generateTestFiles } from '.';
import { defaults } from './options';

const program = new Command();

program
  .name('bddgen')
  .description('Generate Playwright tests from Gherkin documents')
  .option('-o, --output <dir>', 'Output dir', defaults.outputDir)
  .option('-t, --import-test-from <file>', 'Path to file for importing test instance', defaults.importTestFrom)
  .action(async ({ output: outputDir, importTestFrom }) => {
    await generateTestFiles({ outputDir, importTestFrom });
  });

program.parse();
