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

type EnvConfigs = Record<string /* outputDir */, BDDConfig>;

// In-memory cache for all BDD configs
let envConfigsCache: EnvConfigs;

/**
 * Returns config dir for the first BDD config in env.
 */
// eslint-disable-next-line visual/complexity
export function getConfigDirFromEnv<T extends boolean = true>({ throws = true as T } = {}) {
  const envConfigs = getEnvConfigs();
  const keys = Object.keys(envConfigs);
  if (throws && keys.length === 0) {
    exit(`Something went wrong: no BDD configs found.`);
  }

  // Config dir is the same for all BDD configs, so use the first one.
  const firstConfig = envConfigs[keys[0] ?? ''];
  const configDir = firstConfig?.configDir;
  if (throws && !configDir) {
    exit(`Something went wrong: empty 'configDir' in: ${JSON.stringify(firstConfig)}`);
  }

  return configDir as T extends true ? string : string | undefined;
}

export function saveConfigToEnv(config: BDDConfig) {
  const envConfigs = getEnvConfigs();
  const configKey = getConfigKey(config.outputDir);
  const existingConfig = envConfigs[configKey];
  if (existingConfig) {
    // Playwright config can be evaluated several times in one process.
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

/**
 * Note: Playwright's project.testDir is the same as BDD outputDir.
 */
export function getConfigFromEnv(absOutputDir: string) {
  const configKey = getConfigKey(absOutputDir);
  const envConfigs = getEnvConfigs();
  return envConfigs[configKey];
}

export function getEnvConfigs() {
  if (!envConfigsCache) {
    envConfigsCache = JSON.parse(process.env.PLAYWRIGHT_BDD_CONFIGS || '{}');
  }
  return envConfigsCache;
}

function getConfigKey(outputDir: string) {
  return trimTrailingSlash(outputDir);
}

function saveEnvConfigs(envConfigs: EnvConfigs) {
  envConfigsCache = envConfigs;
  process.env.PLAYWRIGHT_BDD_CONFIGS = JSON.stringify(envConfigs);
}

function isSameConfigs(config1: BDDConfig, config2: BDDConfig) {
  return JSON.stringify(config1) === JSON.stringify(config2);
}
