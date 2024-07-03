/**
 * Storing configs in env var PLAYWRIGHT_BDD_CONFIGS as JSON-stringified values.
 * For passing configs to playwright workers and bddgen.
 */

/*
Example of PLAYWRIGHT_BDD_CONFIGS:
{
  '/Users/foo/bar/.features-gen/one': {
    outputDir: '/Users/foo/bar/.features-gen/one',
    paths: [ 'features-one/*.feature' ],
    ...
  },
  '/Users/foo/bar/.features-gen/two': {
    outputDir: '/Users/foo/bar/.features-gen/two',
    paths: [ 'features-two/*.feature' ],
    ...
  },  
} 
*/

import { trimTrailingSlash } from '../utils';
import { exit } from '../utils/exit';
import { BDDConfig } from './types';

type OutputDir = string;
type EnvConfigs = Record<OutputDir, BDDConfig>;

let envConfigsCache: EnvConfigs;

export function saveConfigToEnv(config: BDDConfig) {
  const envConfigs = getEnvConfigs();
  const configKey = getConfigKey(config.outputDir);
  const existingConfig = envConfigs[configKey];
  if (existingConfig) {
    // Playwright config can be evaluated several times.
    // Throw error only if different calls of defineBddConfig() use the same outputDir.
    // See: https://github.com/vitalets/playwright-bdd/issues/39#issuecomment-1653805368
    if (!isSameConfigs(config, existingConfig)) {
      exit(
        `When using several calls of defineBddConfig()`,
        `please manually provide different "outputDir" option for each project,`,
        `or use defineBddProject() helper.`,
      );
    }
    return;
  }
  envConfigs[configKey] = config;
  saveEnvConfigs(envConfigs);
}

export function getConfigFromEnv(testDir: string, { throws = true } = {}) {
  const configKey = getConfigKey(testDir);
  const envConfigs = getEnvConfigs();
  const config = envConfigs[configKey];
  if (!config && throws) {
    exit(
      `BDD config not found for testDir: "${configKey}".`,
      `Available testDirs:\n${Object.keys(envConfigs).join('\n')}`,
    );
  }

  return config;
}

export function getEnvConfigs() {
  if (!envConfigsCache) {
    envConfigsCache = JSON.parse(process.env.PLAYWRIGHT_BDD_CONFIGS || '{}');
  }
  return envConfigsCache;
}

export function hasBddConfig(testDir?: string) {
  return Boolean(testDir && getConfigFromEnv(testDir, { throws: false }));
}

function getConfigKey(testDir: string) {
  return trimTrailingSlash(testDir);
}

function saveEnvConfigs(envConfigs: EnvConfigs) {
  envConfigsCache = envConfigs;
  process.env.PLAYWRIGHT_BDD_CONFIGS = JSON.stringify(envConfigs);
}

function isSameConfigs(config1: BDDConfig, config2: BDDConfig) {
  return JSON.stringify(config1) === JSON.stringify(config2);
}
