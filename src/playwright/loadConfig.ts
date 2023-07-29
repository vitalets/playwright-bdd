/**
 * Loading Playwright config.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/configLoader.ts
 */
import path from 'node:path';
import { requirePlaywrightModule } from './utils';
import { requireTransform } from './transform';

export async function loadConfig(cliConfigPath?: string) {
  const resolvedConfigFile = resolveConfigFile(cliConfigPath);
  await requireTransform().requireOrImport(resolvedConfigFile);
}

export function resolveConfigFile(cliConfigPath?: string): string | null {
  const { resolveConfigFile } = requirePlaywrightModule('lib/common/configLoader.js');
  const configFileOrDirectory = cliConfigPath
    ? path.resolve(process.cwd(), cliConfigPath)
    : process.cwd();
  return resolveConfigFile(configFileOrDirectory);
}
