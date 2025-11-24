/**
 * Loading Playwright config.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/configLoader.ts
 */
import { registerESMLoader } from './esmLoader';
import { requirePlaywrightModule, playwrightVersion } from './utils';

export async function loadConfig(cliConfigPath?: string) {
  const { loadConfig } = requirePlaywrightModule('lib/common/configLoader.js');
  const configLocation = resolveConfigLocation(cliConfigPath);

  // Since PW 1.53 registerEsmLoader is called inside loadConfig.
  // See: https://github.com/microsoft/playwright/commit/b536b38a788b309c019beedd72b25c3d94d7689d
  if (playwrightVersion < '1.53') registerESMLoader();

  // We perform full config processing from Playwright,
  // to correctly set ESM loader configuration.
  const fullConfig = await loadConfig(configLocation);

  return {
    ...configLocation,
    fullConfig,
  };
}

export function resolveConfigLocation(cliConfigPath?: string) {
  const { resolveConfigLocation } = requirePlaywrightModule('lib/common/configLoader.js');
  return resolveConfigLocation(cliConfigPath) as {
    configDir: string;
    // Playwright allows empty resolvedConfigFile, but for playwright-bdd we need it to exist,
    // to get BDD config from there.
    resolvedConfigFile: string;
  };
}
