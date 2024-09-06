/**
 * Store playwright config dir in env to provide access to it in workers.
 * Important that in workers there is different process.argv, that's why we save it to env.
 * Config dir is needed to resolve all paths (features, step definitions).
 */

import path from 'node:path';
import { resolveConfigFile } from '../playwright/loadConfig';
import { getCliConfigPath } from '../cli/options';

/**
 * Returns Playwright config dir considering cli --config option.
 */

export function getPlaywrightConfigDir({ resolveAndSave = false } = {}) {
  let configDir = process.env.PLAYWRIGHT_BDD_CONFIG_DIR;

  if (!configDir) {
    if (resolveAndSave) {
      const cliConfigPath = getCliConfigPath();
      const playwrightConfigFile = resolveConfigFile(cliConfigPath);
      configDir = playwrightConfigFile ? path.dirname(playwrightConfigFile) : process.cwd();
      process.env.PLAYWRIGHT_BDD_CONFIG_DIR = configDir;
    } else {
      throw new Error(`Something went wrong: PLAYWRIGHT_BDD_CONFIG_DIR is not set.`);
    }
  }

  return configDir;
}
