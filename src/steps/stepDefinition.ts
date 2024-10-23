/**
 * Step definition class.
 */

import { CucumberExpression, RegularExpression, Expression } from '@cucumber/cucumber-expressions';
import parseTagsExpression from '@cucumber/tag-expressions';
import { parameterTypeRegistry } from './parameterTypes';
import { PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { PomNode } from './decorators/pomGraph';

export type GherkinStepKeyword = 'Unknown' | 'Given' | 'When' | 'Then';
export type StepPattern = string | RegExp;
export type ProvidedStepOptions = {
  tags?: string;
};

export type StepDefinitionOptions = {
  keyword: GherkinStepKeyword;
  pattern: StepPattern;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => unknown;
  location: PlaywrightLocation;
  customTest?: TestTypeCommon;
  pomNode?: PomNode; // for decorator steps
  worldFixture?: string; // for new cucumber-style steps
  providedOptions?: ProvidedStepOptions; // options passed as second argument
};

export class StepDefinition {
  #expression?: Expression;
  #tagsExpression?: ReturnType<typeof parseTagsExpression>;

  constructor(private options: StepDefinitionOptions) {
    this.buildTagsExpression();
  }

  get keyword() {
    return this.options.keyword;
  }

  get pattern() {
    return this.options.pattern;
  }

  get fn() {
    return this.options.fn;
  }

  get uri() {
    return this.options.location.file;
  }

  get line() {
    return this.options.location.line;
  }

  get customTest() {
    return this.options.customTest;
  }

  get pomNode() {
    return this.options.pomNode;
  }

  get worldFixture() {
    return this.options.worldFixture;
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
  isDecorator(): this is this & { pomNode: PomNode } {
    return Boolean(this.options.pomNode);
  }

  /**
   * New cucumber-style steps have worldFixture in step config.
   */
  isCucumberStyle(): this is this & { worldFixture: string } {
    return Boolean(this.options.worldFixture);
  }

  matchesTags(tags: string[]) {
    return this.#tagsExpression ? this.#tagsExpression.evaluate(tags) : true;
  }

  private buildTagsExpression() {
    const tags = this.options.providedOptions?.tags;
    if (tags) {
      this.#tagsExpression = parseTagsExpression(tags);
    }
  }
}
