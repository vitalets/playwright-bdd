import fs from 'node:fs';
import { Command } from 'commander';
import { configOption } from '../options';
import path from 'node:path';
import { logger } from '../../utils/logger';

export const envCommand = new Command('env')
  .description('Prints environment info')
  .addOption(configOption)
  .action(async () => {
    logger.log(`Playwright-bdd environment info:\n`);
    logger.log(`platform: ${process.platform}`);
    logger.log(`node: ${process.version}`);
    showPackageVersion('playwright-bdd');
    showPackageVersion('@playwright/test');
    showPackageVersion('@cucumber/cucumber');
  });

function showPackageVersion(packageName: string) {
  let version = '';
  if (packageName === 'playwright-bdd') {
    version = getOwnVersion();
  } else {
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    version = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version;
  }
  logger.log(`${packageName}: v${version}`);
}

export function getOwnVersion() {
  const packageJsonPath = path.resolve(__dirname, '..', '..', '..', `package.json`);
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return pkg.version;
}
