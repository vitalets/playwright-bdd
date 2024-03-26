import path from 'node:path';
import { Command } from 'commander';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { ConfigOption, configOption } from '../options';
import { loadConfig as loadPlaywrightConfig } from '../../playwright/loadConfig';
import { Logger } from '../../utils/logger';
import { getEnvConfigs } from '../../config/env';
import { assertConfigsCount } from './test';
import { BDDConfig } from '../../config';
import { TestFilesGenerator } from '../../gen';

const logger = new Logger({ verbose: true });

type Opts = ConfigOption & {
  unusedSteps?: boolean;
};

export const exportCommand = new Command('export')
  .description('Prints step definitions')
  .addOption(configOption)
  .option('--unused-steps', 'Output only unused steps')
  .action(async (opts: Opts) => {
    const { resolvedConfigFile } = await loadPlaywrightConfig(opts.config);
    logger.log(`Using config: ${path.relative(process.cwd(), resolvedConfigFile)}`);
    const configs = Object.values(getEnvConfigs());
    assertConfigsCount(configs);
    if (opts.unusedSteps) {
      await showUnusedStepsForConfigs(configs);
    } else {
      await showStepsForConfigs(configs);
    }
  });

async function showStepsForConfigs(configs: BDDConfig[]) {
  // here we don't need workers (as in test command) because if some step files
  // are already in node cache, we collected them.
  const steps = new Set<string>();
  const tasks = configs.map(async (config) => {
    const stepDefinitions = await new TestFilesGenerator(config).extractSteps();
    stepDefinitions.forEach((s) => steps.add(`* ${getStepText(s)}`));
  });

  await Promise.all(tasks);

  logger.log(`List of all steps (${steps.size}):`);
  steps.forEach((stepText) => logger.log(stepText));
}

async function showUnusedStepsForConfigs(configs: BDDConfig[]) {
  const steps = new Set<string>();
  const tasks = configs.map(async (config) => {
    const stepDefinitions = await new TestFilesGenerator(config).extractUnusedSteps();
    stepDefinitions.forEach((s) => steps.add(`* ${getStepText(s)}`));
  });

  await Promise.all(tasks);

  logger.log(`List of unused steps (${steps.size}):`);
  steps.forEach((stepText) => logger.log(stepText));
}

function getStepText({ pattern, keyword }: StepDefinition) {
  // for Unknown return When as it looks the most suitable
  const keywordText = keyword === 'Unknown' ? 'When' : keyword;
  const patternText = typeof pattern === 'string' ? pattern : pattern.source;
  return `${keywordText} ${patternText}`;
}
