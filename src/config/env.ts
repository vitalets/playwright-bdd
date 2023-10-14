/**
 * Storing configs in env var PLAYWRIGHT_BDD_CONFIGS as JSON-stringified values.
 * For passing configs to playwright workers and bddgen.
 */

import path from 'node:path';
import { BDDConfig } from '.';
import { exit } from '../utils/exit';

type OutputDir = string;
type EnvConfigs = Record<OutputDir, BDDConfig>;

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

export function getConfigFromEnv(outputDir: string) {
  const envConfigs = getEnvConfigs();
  outputDir = path.resolve(outputDir);
  const config = envConfigs[outputDir];
  if (!config) {
    exit(
      `Config not found for outputDir: "${outputDir}".`,
      `Available dirs: ${Object.keys(envConfigs).join('\n')}`,
    );
  }

  return config;
}

export function getEnvConfigs() {
  return JSON.parse(process.env.PLAYWRIGHT_BDD_CONFIGS || '{}') as EnvConfigs;
}

function saveEnvConfigs(envConfigs: EnvConfigs) {
  process.env.PLAYWRIGHT_BDD_CONFIGS = JSON.stringify(envConfigs);
}

function isSameConfigs(config1: BDDConfig, config2: BDDConfig) {
  return JSON.stringify(config1) === JSON.stringify(config2);
}
