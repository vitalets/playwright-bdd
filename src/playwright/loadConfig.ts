/**
 * Loading Playwright config.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/configLoader.ts
 */
import { requirePlaywrightModule, playwrightVersion } from './utils';

export async function loadConfig(cliConfigPath?: string) {
  const { loadConfig } = getConfigLoaderMethods();
  const configLocation = resolveConfigLocation(cliConfigPath);

  // We perform full config processing from Playwright,
  // to correctly set ESM loader configuration.
  const fullConfig = await loadConfig(configLocation);

  return {
    ...configLocation,
    fullConfig,
  };
}

export function resolveConfigLocation(cliConfigPath?: string) {
  const { resolveConfigLocation } = getConfigLoaderMethods();
  return resolveConfigLocation(cliConfigPath) as {
    configDir: string;
    // Playwright allows empty resolvedConfigFile, but for playwright-bdd we need it to exist,
    // to get BDD config from there.
    resolvedConfigFile: string;
  };
}

function getConfigLoaderMethods() {
  const { loadConfig, resolveConfigLocation } =
    // Since PW 1.60 there is an index.js file with all exports.
    playwrightVersion >= '1.60.0'
      ? requirePlaywrightModule('lib/common/index.js').configLoader
      : requirePlaywrightModule('lib/common/configLoader.js');

  return { loadConfig, resolveConfigLocation };
}
