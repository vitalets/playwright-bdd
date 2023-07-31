/**
 * Store playwright config dir in env to provide access to it in workers.
 * Important that in workers there is different process.argv, that's why we save it to env.
 * Config dir is needed to resolve all paths.
 */

import path from 'node:path';
import { Command } from 'commander';
import { resolveConfigFile } from '../playwright/loadConfig';

/**
 * Resolve playwright config dir considering cli flags.
 * todo: keep in sync with resolving config in gen/cli.ts
 */
export function getPlaywrightConfigDir() {
  if (!process.env.PLAYWRIGHT_BDD_CONFIG_DIR) {
    const cliConfigPath = new Command()
      .allowUnknownOption()
      .option('-c, --config <file>')
      .parse()
      .opts().config;
    const playwrightConfigFile = resolveConfigFile(cliConfigPath);
    process.env.PLAYWRIGHT_BDD_CONFIG_DIR = playwrightConfigFile
      ? path.dirname(playwrightConfigFile)
      : process.cwd();
  }

  return process.env.PLAYWRIGHT_BDD_CONFIG_DIR;
}
