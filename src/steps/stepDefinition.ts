/**
 * Step definition class.
 */

import { CucumberExpression, RegularExpression, Expression } from '@cucumber/cucumber-expressions';
import { parameterTypeRegistry } from './parameterTypes';
import { PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { PomNode } from './decorators/pomGraph';

export type GherkinStepKeyword = 'Unknown' | 'Given' | 'When' | 'Then';
export type StepPattern = string | RegExp;

export type StepDefinitionOptions = {
  keyword: GherkinStepKeyword;
  pattern: StepPattern;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => unknown;
  location: PlaywrightLocation;
  customTest?: TestTypeCommon;
  pomNode?: PomNode; // for decorator steps
  worldFixture?: string; // for new cucumber-style steps
};

export class StepDefinition {
  #expression?: Expression;

  constructor(public options: StepDefinitionOptions) {}

  get keyword() {
    return this.options.keyword;
  }

  get pattern() {
    return this.options.pattern;
  }

  // todo: rename to fn to be consistent with options?
  get code() {
    return this.options.fn;
  }

  get uri() {
    return this.options.location.file;
  }

  get line() {
    return this.options.location.line;
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

  /**
   * Decorator steps have pom node.
   */
  isDecorator(): this is this & { options: StepDefinitionOptions & { pomNode: PomNode } } {
    return Boolean(this.options.pomNode);
  }

  /**
   * New cucumber-style steps have worldFixture in step config.
   */
  isCucumberStyle(): this is this & { options: StepDefinitionOptions & { worldFixture: string } } {
    return Boolean(this.options.worldFixture);
  }
}
