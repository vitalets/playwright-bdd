/**
 * Own step definitions registry.
 */

import { CucumberExpression, RegularExpression, Expression } from '@cucumber/cucumber-expressions';
import { parameterTypeRegistry } from './parameterTypes';
import { StepConfig } from './stepConfig';
import { relativeToCwd } from '../utils/paths';
import { exit } from '../utils/exit';

export type GherkinStepKeyword = 'Unknown' | 'Given' | 'When' | 'Then';
export type DefineStepPattern = string | RegExp;

// todo: merge with StepConfig to have single class
export class StepDefinition {
  #expression?: Expression;

  constructor(public stepConfig: StepConfig) {}

  get keyword() {
    return this.stepConfig.keyword;
  }

  get pattern() {
    return this.stepConfig.pattern;
  }

  get code() {
    return this.stepConfig.fn;
  }

  get uri() {
    return this.stepConfig.location.file;
  }

  get line() {
    return this.stepConfig.location.line;
  }

  get expression() {
    // create expression lazily b/c we need all parameter types to be loaded
    if (!this.#expression) {
      this.#expression =
        typeof this.pattern === 'string'
          ? new CucumberExpression(this.pattern, parameterTypeRegistry)
          : new RegularExpression(this.pattern, parameterTypeRegistry);
    }

    return this.#expression;
  }

  get patternString() {
    return typeof this.pattern === 'string' ? this.pattern : this.pattern.source;
  }
}

export const stepDefinitions: StepDefinition[] = [];

export function registerStepDefinition(stepConfig: StepConfig) {
  const stepDefinition = new StepDefinition(stepConfig);
  stepDefinitions.push(stepDefinition);
}

// todo: don't call exit here, call it upper
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
