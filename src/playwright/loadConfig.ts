/**
 * Loading Playwright config.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/configLoader.ts
 */
import path from 'node:path';
import { requirePlaywrightModule } from './utils';

export async function loadConfig(cliConfig?: string) {
  const { ConfigLoader, resolveConfigFile } = requirePlaywrightModule('lib/common/configLoader.js');
  const configFileOrDirectory = cliConfig ? path.resolve(process.cwd(), cliConfig) : process.cwd();
  const resolvedConfigFile = resolveConfigFile(configFileOrDirectory);
  const configLoader = new ConfigLoader();

  return configLoader.loadConfigFile(resolvedConfigFile, true);
}
