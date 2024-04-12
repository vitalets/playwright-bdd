import { IRunConfiguration, IRunEnvironment, loadSupport } from '@cucumber/cucumber/api';
import { installTransform } from '../playwright/transform';
import { exit } from '../utils/exit';
import { ISupportCodeLibrary, StepDefinition } from './types';
import { getStepConfig } from '../steps/stepConfig';
import path from 'node:path';

const cache = new Map<string, Promise<ISupportCodeLibrary>>();

export async function loadSteps(
  runConfiguration: IRunConfiguration,
  environment: IRunEnvironment = {},
) {
  const cacheKey = JSON.stringify(runConfiguration);
  let lib = cache.get(cacheKey);

  if (!lib) {
    // use Playwright's built-in hook to compile TypeScript steps
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const uninstall = !hasTsNodeRegister(runConfiguration) ? installTransform() : () => {};
    lib = loadSupport(runConfiguration, environment).finally(() =>
      uninstall(),
    ) as Promise<ISupportCodeLibrary>;
    cache.set(cacheKey, lib);
  }

  return lib;
}

/**
 * Finds step definition by step text.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/assemble_test_cases.ts#L103
 *
 * Handling case when several step definitions found:
 * https://github.com/cucumber/cucumber-js/blob/main/src/runtime/test_case_runner.ts#L313
 */
export function findStepDefinition(
  supportCodeLibrary: ISupportCodeLibrary,
  stepText: string,
  featureFile: string,
) {
  const matchedSteps = supportCodeLibrary.stepDefinitions.filter((step) => {
    return step.matchesStepName(stepText);
  });
  if (matchedSteps.length === 0) return;
  if (matchedSteps.length > 1) {
    exit(formtDuplicateStepsError(stepText, featureFile, matchedSteps));
  }

  return matchedSteps[0];
}

export function hasTsNodeRegister(runConfiguration: IRunConfiguration) {
  return runConfiguration.support.requireModules.includes('ts-node/register');
}

function formtDuplicateStepsError(
  stepText: string,
  featureFile: string,
  matchedSteps: StepDefinition[],
) {
  const stepLines = matchedSteps.map(formatDuplicateStep);
  return [
    `Multiple step definitions matched for text: "${stepText}" (${featureFile})`,
    ...stepLines,
  ].join('\n');
}

function formatDuplicateStep(step: StepDefinition) {
  const { pattern } = step;
  const patternText = typeof pattern === 'string' ? pattern : pattern.source;
  const { location } = getStepConfig(step) || {};
  const file = location ? path.relative(process.cwd(), location.file) : '';
  const locationStr = location ? ` - ${file}:${location.line}` : '';
  return `  ${patternText}${locationStr}`;
}
