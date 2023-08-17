import fs from 'node:fs';
import { Command } from 'commander';
import { ConfigOption, configOption } from '../options';
import path from 'node:path';
import { logger } from '../../utils/logger';
import { getPackageVersion } from '../../utils';
import { resolveConfigFile } from '../../playwright/loadConfig';

export const envCommand = new Command('env')
  .description('Prints environment info')
  .addOption(configOption)
  .action((opts: ConfigOption) => {
    logger.log(`Playwright-bdd environment info:\n`);
    logger.log(`platform: ${process.platform}`);
    logger.log(`node: ${process.version}`);
    showPackageVersion('playwright-bdd');
    showPackageVersion('@playwright/test');
    showPackageVersion('@cucumber/cucumber');
    showPlaywrightConfigPath(opts.config);
  });

function showPackageVersion(packageName: string) {
  const version =
    packageName === 'playwright-bdd' ? getOwnVersion() : getPackageVersion(packageName);
  logger.log(`${packageName}: v${version}`);
}

/**
 * Getting own version by relative path instead of using getPackageVersion(),
 * to aneble using directly from /dist in tests.
 */
export function getOwnVersion() {
  const packageJsonPath = path.resolve(__dirname, '..', '..', '..', `package.json`);
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return pkg.version;
}

function showPlaywrightConfigPath(cliConfigPath?: string) {
  const resolvedConfigFile = resolveConfigFile(cliConfigPath);
  const relPath = path.relative(process.cwd(), resolvedConfigFile);
  logger.log(`Playwright config file: ${relPath}`);
}
