#!/usr/bin/env node

import { Command } from 'commander';
import { generateTestFiles } from '.';

const program = new Command();

program
  .name('bddgen')
  .description('Generate Playwright tests from Gherkin documents')
  .option('-o, --output <dir>', 'Output dir', '.features-gen')
  .action(async ({ output }) => {
    await generateTestFiles({ outputDir: output });
  });

program.parse();
