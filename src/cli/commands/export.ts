import path from 'node:path';
import { Command } from 'commander';
import Table from 'cli-table3';
import { ConfigOption } from '../options';
import { loadConfig as loadPlaywrightConfig } from '../../playwright/loadConfig';
import { Logger } from '../../utils/logger';
import { getEnvConfigs } from '../../config/env';
import { assertConfigsCount } from './test';
import { TestFilesGenerator } from '../../gen';
import { relativeToCwd } from '../../utils/paths';
import { BDDConfig } from '../../config/types';
import { StepDefinition } from '../../steps/registry';
import { forceExitIfNeeded } from '../helpers';

const logger = new Logger({ verbose: true });

type ExportCommandOptions = ConfigOption & {
  unusedSteps?: boolean;
};

export const exportCommand = new Command('export')
  .description('Prints step definitions')
  .configureHelp({ showGlobalOptions: true })
  .option('--unused-steps', 'Output only unused steps')
  .action(async () => {
    const opts = exportCommand.optsWithGlobals<ExportCommandOptions>();
    const { resolvedConfigFile } = await loadPlaywrightConfig(opts.config);
    logger.log(`Using config: ${path.relative(process.cwd(), resolvedConfigFile)}`);
    const configs = Object.values(getEnvConfigs());
    assertConfigsCount(configs);
    if (opts.unusedSteps) {
      await showUnusedStepsForConfigs(configs);
    } else {
      await showStepsForConfigs(configs);
    }

    forceExitIfNeeded();
  });

async function showStepsForConfigs(configs: BDDConfig[]) {
  // here we don't need workers (as in test command) because if some step files
  // are already in node cache, we collected them.
  const steps = new Set<string>();
  const tasks = configs.map(async (config) => {
    const stepDefinitions = await new TestFilesGenerator(config).extractSteps();
    stepDefinitions.forEach((s) => steps.add(`* ${formatStepText(s)}`));
  });

  await Promise.all(tasks);

  logger.log(`List of all steps (${steps.size}):`);
  steps.forEach((stepText) => logger.log(stepText));
}

async function showUnusedStepsForConfigs(configs: BDDConfig[]) {
  const steps = new Set<StepDefinition>();
  const tasks = configs.map(async (config) => {
    const stepDefinitions = await new TestFilesGenerator(config).extractUnusedSteps();
    stepDefinitions.forEach((step) => steps.add(step));
  });

  await Promise.all(tasks);

  logger.log(`Unused steps (${steps.size}):`);
  logger.log(formatUnusedStepsTable(steps));
}

function formatUnusedStepsTable(steps: Set<StepDefinition>) {
  const table = new Table({
    head: ['Pattern / Text', /*'Duration', */ 'Location'],
    style: { border: [], head: [] }, // disable colors
  });
  steps.forEach((step) => {
    table.push([formatStepText(step), formatStepLocation(step)]);
  });
  return table.toString();
}

function formatStepText({ pattern, keyword }: StepDefinition) {
  // for Unknown return When as it looks the most suitable
  const keywordText = keyword === 'Unknown' ? 'When' : keyword;
  const patternText = typeof pattern === 'string' ? pattern : pattern.source;
  return `${keywordText} ${patternText}`;
}

function formatStepLocation(step: StepDefinition) {
  return `${relativeToCwd(step.uri)}:${step.line}`;
}
