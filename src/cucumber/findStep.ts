import { exit } from '../utils/exit';
import { ISupportCodeLibrary, StepDefinition } from './types';
import { getStepConfig } from '../steps/stepConfig';
import { relativeToCwd } from '../utils/paths';

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
    exit(formatDuplicateStepsError(stepText, featureFile, matchedSteps));
  }

  return matchedSteps[0];
}

function formatDuplicateStepsError(
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
  const file = location ? relativeToCwd(location.file) : '';
  const locationStr = location ? ` - ${file}:${location.line}` : '';
  return `  ${patternText}${locationStr}`;
}
