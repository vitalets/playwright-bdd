#!/usr/bin/env node

import { Command } from 'commander';
import { testCommand } from './commands/test';
import { envCommand } from './commands/env';
import { exportCommand } from './commands/export';
import { getPackageVersion } from '../utils';

const program = new Command();
const version = getPackageVersion('playwright-bdd');
program
  .name('bddgen')
  .description(`Playwright-bdd CLI v${version}`)
  .version(version)
  .addCommand(testCommand, { isDefault: true })
  .addCommand(exportCommand)
  .addCommand(envCommand)
  .addHelpCommand(false)
  .parse();
