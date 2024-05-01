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

import path from 'node:path';
import { BDDConfig } from '.';
import { exit } from '../utils/exit';

type OutputDir = string;
type EnvConfigs = Record<OutputDir, BDDConfig>;

let envConfigsCache: EnvConfigs;

export function saveConfigToEnv(config: BDDConfig) {
  const envConfigs = getEnvConfigs();
  const existingConfig = envConfigs[config.outputDir];
  if (existingConfig) {
    // Playwright config can be evaluated several times.
    // Throw error only if different calls of defineBddConfig() use the same outputDir.
    // See: https://github.com/vitalets/playwright-bdd/issues/39#issuecomment-1653805368
    if (!isSameConfigs(config, existingConfig)) {
      exit(
        `When using several calls of defineBddConfig()`,
        `please manually provide different "outputDir" option.`,
      );
    }
    return;
  }
  envConfigs[config.outputDir] = config;
  saveEnvConfigs(envConfigs);
}

export function getConfigFromEnv(testDir: string, { throws = true } = {}) {
  testDir = path.normalize(testDir);
  const envConfigs = getEnvConfigs();
  const config = envConfigs[testDir];
  if (!config && throws) {
    exit(
      `BDD config not found for testDir: "${testDir}".`,
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

function saveEnvConfigs(envConfigs: EnvConfigs) {
  envConfigsCache = envConfigs;
  process.env.PLAYWRIGHT_BDD_CONFIGS = JSON.stringify(envConfigs);
}

function isSameConfigs(config1: BDDConfig, config2: BDDConfig) {
  return JSON.stringify(config1) === JSON.stringify(config2);
}
