/**
 * Loading Playwright config.
 * Note: Playwright Config loader is not in package.exports -> require it by absolute path
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/configLoader.ts
 */
import path from 'node:path';

export async function loadConfig(cliConfig?: string) {
  const m = path.dirname(require.resolve('@playwright/test'));
  const configLoaderPath = path.join(m, 'lib', 'common', 'configLoader.js');
  const { ConfigLoader, resolveConfigFile } = await import(configLoaderPath);

  const configFileOrDirectory = cliConfig ? path.resolve(process.cwd(), cliConfig) : process.cwd();
  const resolvedConfigFile = resolveConfigFile(configFileOrDirectory);
  const configLoader = new ConfigLoader();

  return configLoader.loadConfigFile(resolvedConfigFile, true);
}
