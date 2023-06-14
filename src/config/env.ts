/**
 * Storing configs in env var PLAYWRIGHT_BDD_CONFIGS as JSON-stringified values.
 * For passing configs to playwright workers and bddgen.
 */

import path from 'node:path';
import { BDDConfig } from '.';
import { exitWithMessage } from '../utils';

type OutputDir = string;
export type EnvConfigs = Record<OutputDir, BDDConfig & { _pid: number }>;

export function saveConfigToEnv(config: BDDConfig) {
  const envConfigs = getEnvConfigs();
  const existingConfig = envConfigs[config.outputDir];
  if (existingConfig) {
    // in --ui mode playwright forks another process without TEST_WORKER_INDEX,
    // but with existing env vars. That's why we additionally store/check process id
    // to distinguish incorrect several calls of defineBddConfig() from correct calls
    // in different processes.
    if (existingConfig._pid === process.pid) {
      exitWithMessage(
        `When using several calls of defineBddConfig()`,
        `please manually provide different "outputDir" option.`,
      );
    }
    return;
  }
  envConfigs[config.outputDir] = { ...config, _pid: process.pid };
  saveEnvConfigs(envConfigs);
}

export function getConfigFromEnv(outputDir: string) {
  const envConfigs = getEnvConfigs();
  outputDir = path.resolve(outputDir);
  const config = envConfigs[outputDir];
  if (!config) {
    exitWithMessage(
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
