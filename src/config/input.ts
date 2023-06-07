/**
 * Input configs manager.
 *
 * Configs stored in env var PLAYWRIGHT_BDD_CONFIGS as JSON-stringified value.
 * Storing in global var is not possible b/c playwright workers
 * don't import playwright.config.ts on subsequent runs.
 *
 * outputDir used as a unique key.
 */
import path from 'node:path';
import { BDDInputConfig } from '.';
import { exitWithMessage } from '../utils';

type InputConfigs = Record<string, BDDInputConfig | undefined>;

export function registerInputConfig(outputDir: string, inputConfig?: BDDInputConfig) {
  // outputDir used as an unique key of inputConfig
  const inputConfigs = getInputConfigsFromEnv();
  if (inputConfigs[outputDir]) {
    exitWithMessage(
      `When using several calls of generateBDDTests() in Playwright config`,
      `please manually provide different "outputDir" option.`,
    );
  }
  inputConfigs[outputDir] = inputConfig || {};
  storeInputConfigsToEnv(inputConfigs);
}

export function getInputConfig(outputDir?: string) {
  if (!outputDir) return;
  const inputConfigs = getInputConfigsFromEnv();
  const keys = Object.keys(inputConfigs);
  if (keys.length === 0) return;
  // For single config just return what we have
  if (keys.length === 1) return inputConfigs[keys[0]];
  outputDir = path.resolve(outputDir);
  if (!inputConfigs[outputDir]) {
    throw new Error(
      `Config not found for outputDir: "${outputDir}". ` +
        `Available keys: ${Object.keys(inputConfigs).join(', ')}`,
    );
  }
  return inputConfigs[outputDir];
}

function getInputConfigsFromEnv() {
  return JSON.parse(process.env.PLAYWRIGHT_BDD_CONFIGS || '{}') as InputConfigs;
}

function storeInputConfigsToEnv(inputConfigs: InputConfigs) {
  process.env.PLAYWRIGHT_BDD_CONFIGS = JSON.stringify(inputConfigs);
}
