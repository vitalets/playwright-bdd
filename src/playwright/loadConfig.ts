/**
 * Loading Playwright config.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/configLoader.ts
 */
import path from 'node:path';
import fs from 'node:fs';
import { requirePlaywrightModule } from './utils';
import { exit } from '../utils/exit';
import { requireOrImport } from './requireOrImport';
import { getCliConfigPath } from '../cli/options';

export async function loadConfig(cliConfigPath?: string) {
  const resolvedConfigFile = resolveConfigFile(cliConfigPath);
  assertConfigFileExists(resolvedConfigFile, cliConfigPath);
  await requireOrImport(resolvedConfigFile);
  return { resolvedConfigFile };
}

/**
 * Returns Playwright config dir considering cli --config option.
 * Note: This fn must be called only in main process, because in workers
 * process.argv is different.
 */
export function resolveConfigDir() {
  const cliConfigPath = getCliConfigPath();
  const playwrightConfigFileFromCli = resolveConfigFile(cliConfigPath);
  return playwrightConfigFileFromCli ? path.dirname(playwrightConfigFileFromCli) : process.cwd();
}

export function resolveConfigFile(cliConfigPath?: string): string {
  const { resolveConfigFile, resolveConfigLocation } = requirePlaywrightModule(
    'lib/common/configLoader.js',
  );
  // Since Playwright 1.44 configLoader.js exports resolveConfigLocation()
  // See: https://github.com/microsoft/playwright/pull/30275
  if (typeof resolveConfigLocation === 'function') {
    return resolveConfigLocation(cliConfigPath).resolvedConfigFile || '';
  } else {
    const configFileOrDirectory = getConfigFilePath(cliConfigPath);
    return resolveConfigFile(configFileOrDirectory) || '';
  }
}

function getConfigFilePath(cliConfigPath?: string) {
  return cliConfigPath ? path.resolve(process.cwd(), cliConfigPath) : process.cwd();
}

function assertConfigFileExists(resolvedConfigFile: string | null, cliConfigPath?: string) {
  if (!resolvedConfigFile || !fs.existsSync(resolvedConfigFile)) {
    const configFilePath = getConfigFilePath(cliConfigPath);
    exit(`Can't find Playwright config file in: ${configFilePath}`);
  }
}
