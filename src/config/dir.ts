/**
 * Store playwright config dir in env to provide access to it in workers.
 * Important that in workers there is different process.argv, that's why we save it to env.
 * Config dir is needed to resolve all paths (features, step definitions).
 */

import path from 'node:path';
import { resolveConfigFile } from '../playwright/loadConfig';
import { getCliConfigPath } from '../cli/options';

/**
 * Resolve playwright config dir considering cli flags.
 */
export function getPlaywrightConfigDir() {
  if (!process.env.PLAYWRIGHT_BDD_CONFIG_DIR) {
    const cliConfigPath = getCliConfigPath();
    const playwrightConfigFile = resolveConfigFile(cliConfigPath);
    process.env.PLAYWRIGHT_BDD_CONFIG_DIR = playwrightConfigFile
      ? path.dirname(playwrightConfigFile)
      : process.cwd();
  }

  return process.env.PLAYWRIGHT_BDD_CONFIG_DIR;
}
