#!/usr/bin/env node

import { Command } from 'commander';
import { testCommand } from './commands/test';
import { envCommand } from './commands/env';
import { exportCommand } from './commands/export';
import { getPackageVersion } from '../utils';
import { configOption } from './options';

const program = new Command();
const version = getPackageVersion('playwright-bdd');
program
  .name('bddgen')
  .description(`Playwright-bdd CLI v${version}`)
  .addOption(configOption)
  .version(version, '-v, --version', 'Output playwright-bdd version')
  .helpCommand(false)
  .addCommand(testCommand, { isDefault: true })
  .addCommand(exportCommand)
  .addCommand(envCommand)
  .parse();
