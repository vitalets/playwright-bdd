#!/usr/bin/env node

import { Command } from 'commander';
import { testCommand } from './commands/test';
import { envCommand, getOwnVersion } from './commands/env';

const program = new Command();

program
  .name('bddgen')
  .description(`Playwright-bdd CLI v${getOwnVersion()}`)
  .addCommand(testCommand, { isDefault: true })
  .addCommand(envCommand)
  .addHelpCommand(false)
  .parse();
