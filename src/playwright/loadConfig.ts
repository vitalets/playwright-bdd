/**
 * Loading Playwright config.
 * Note: Playwright Config loader is not in package.exports -> require it by absolute path
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/configLoader.ts
 */
import path from 'node:path';

export async function loadConfig(cliConfig?: string) {
  const { ConfigLoader, resolveConfigFile } = requireConfigLoader();
  const configFileOrDirectory = cliConfig ? path.resolve(process.cwd(), cliConfig) : process.cwd();
  const resolvedConfigFile = resolveConfigFile(configFileOrDirectory);
  const configLoader = new ConfigLoader();

  return configLoader.loadConfigFile(resolvedConfigFile, true);
}

function requireConfigLoader() {
  const playwrightRoot = path.dirname(require.resolve('@playwright/test'));
  const configLoaderPath = path.join(playwrightRoot, 'lib', 'common', 'configLoader.js');
  return require(configLoaderPath);
}
