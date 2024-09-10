import { Command } from 'commander';
import { ConfigOption } from '../options';
import { Logger } from '../../utils/logger';
import { getPackageVersion } from '../../utils';
import { resolveConfigFile } from '../../playwright/loadConfig.js';
import { relativeToCwd } from '../../utils/paths';

const logger = new Logger({ verbose: true });

type EnvCommandOptions = ConfigOption;

export const envCommand = new Command('env')
  .description('Prints environment info')
  .configureHelp({ showGlobalOptions: true })
  .action(() => {
    const opts = envCommand.optsWithGlobals<EnvCommandOptions>();
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
  const versionStr = version ? `v${version}` : 'none';
  logger.log(`${packageName}: ${versionStr}`);
}

function showPlaywrightConfigPath(cliConfigPath?: string) {
  const resolvedConfigFile = resolveConfigFile(cliConfigPath);
  logger.log(`Playwright config file: ${relativeToCwd(resolvedConfigFile)}`);
}
