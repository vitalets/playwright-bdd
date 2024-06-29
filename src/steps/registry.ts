/**
 * Own step definitions registry.
 */

import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions';
import { Expression } from '@cucumber/cucumber-expressions';
import { parameterTypeRegistry } from './parameterTypes';
import { StepConfig } from './stepConfig';
import { relativeToCwd } from '../utils/paths';
import { exit } from '../utils/exit';

export type GherkinStepKeyword = 'Unknown' | 'Given' | 'When' | 'Then';
export type DefineStepPattern = string | RegExp;

export type StepDefinition = {
  keyword: GherkinStepKeyword;
  pattern: DefineStepPattern;
  patternString: string;
  expression: Expression;
  code: Function; // eslint-disable-line @typescript-eslint/ban-types
  line: number;
  uri: string;
  // initial step config
  // todo: merge into step definition in the future
  stepConfig: StepConfig;
};

export const stepDefinitions: StepDefinition[] = [];

export function registerStepDefinition(stepConfig: StepConfig) {
  const { keyword, pattern } = stepConfig;
  const { file: uri, line } = stepConfig.location;

  // todo: handle error.undefinedParameterTypeName as it's done in cucumber?
  const expression =
    typeof pattern === 'string'
      ? new CucumberExpression(pattern, parameterTypeRegistry)
      : new RegularExpression(pattern, parameterTypeRegistry);

  stepDefinitions.push({
    keyword,
    pattern,
    patternString: typeof pattern === 'string' ? pattern : pattern.source,
    expression,
    code: stepConfig.fn,
    uri,
    line,
    stepConfig,
  });
}

// todo: dont call exit here, call it upper
export function findStepDefinition(stepText: string, featureFile: string) {
  const matchedSteps = stepDefinitions.filter((step) => {
    return Boolean(step.expression.match(stepText));
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
  const stepLines = matchedSteps.map((step) => {
    const file = step.uri ? relativeToCwd(step.uri) : '';
    return `  ${step.patternString} - ${file}:${step.line}`;
  });

  return [
    `Multiple step definitions matched for text: "${stepText}" (${featureFile})`,
    ...stepLines,
  ].join('\n');
}
