import path from 'node:path';
import { Command } from 'commander';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { configOption } from '../options';
import { loadConfig as loadPlaywrightConfig } from '../../playwright/loadConfig';
import { logger } from '../../utils/logger';
import { getEnvConfigs } from '../../config/env';
import { assertConfigsCount } from './test';
import { BDDConfig } from '../../config';
import { TestFilesGenerator } from '../../gen';

// filter by project?

export const exportCommand = new Command('export')
  .description('Prints all step definitions')
  .addOption(configOption)
  .action(async (opts) => {
    const { resolvedConfigFile } = await loadPlaywrightConfig(opts.config);
    logger.log(
      `List of all steps found by config: ${path.relative(process.cwd(), resolvedConfigFile)}\n`,
    );
    const configs = Object.values(getEnvConfigs());
    assertConfigsCount(configs);
    await showStepsForConfigs(configs);
  });

async function showStepsForConfigs(configs: BDDConfig[]) {
  // here we don't need workers (as in test command) because if some step files
  // are already in node cache, we collected them.
  const steps = new Set<string>();
  const tasks = configs.map(async (config) => {
    const stepDefinitions = await new TestFilesGenerator(config).getSteps();
    stepDefinitions.forEach((s) => steps.add(`* ${getStepText(s)}`));
  });

  await Promise.all(tasks);

  steps.forEach((stepText) => logger.log(stepText));
}

function getStepText({ pattern, keyword }: StepDefinition) {
  // for Unknown return When as it looks the most suitable
  const keywordText = keyword === 'Unknown' ? 'When' : keyword;
  const patternText = typeof pattern === 'string' ? pattern : pattern.source;
  return `${keywordText} ${patternText}`;
}
