/**
 * Own step definitions registry.
 */

import { CucumberExpression, RegularExpression, Expression } from '@cucumber/cucumber-expressions';
import { parameterTypeRegistry } from './parameterTypes';
import { StepConfig } from './stepConfig';

export type GherkinStepKeyword = 'Unknown' | 'Given' | 'When' | 'Then';
export type DefineStepPattern = string | RegExp;

export const stepDefinitions: StepDefinition[] = [];

export function registerStepDefinition(stepConfig: StepConfig) {
  const stepDefinition = new StepDefinition(stepConfig);
  stepDefinitions.push(stepDefinition);
}

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
