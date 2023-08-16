#!/usr/bin/env node

import { Command } from 'commander';
import { testCommand } from './commands/test';
import { envCommand, getOwnVersion } from './commands/env';
import { exportCommand } from './commands/export';

const program = new Command();

program
  .name('bddgen')
  .description(`Playwright-bdd CLI v${getOwnVersion()}`)
  .addCommand(testCommand, { isDefault: true })
  .addCommand(exportCommand)
  .addCommand(envCommand)
  .addHelpCommand(false)
  .parse();
