import { Command } from 'commander';
import { ConfigOption, configOption } from '../options';
import path from 'node:path';
import { Logger } from '../../utils/logger';
import { getPackageVersion } from '../../utils';
import { resolveConfigFile } from '../../playwright/loadConfig';

const logger = new Logger({ verbose: true });

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
  const version = getPackageVersion(packageName);
  logger.log(`${packageName}: v${version}`);
}

function showPlaywrightConfigPath(cliConfigPath?: string) {
  const resolvedConfigFile = resolveConfigFile(cliConfigPath);
  const relPath = path.relative(process.cwd(), resolvedConfigFile);
  logger.log(`Playwright config file: ${relPath}`);
}
