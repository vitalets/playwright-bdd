/**
 * Playwright-bdd's step config.
 */

import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import {
  DefineStepPattern,
  TestStepFunction,
} from '@cucumber/cucumber/lib/support_code_library_builder/types';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { BddWorld } from '../run/bddWorld';
import { PlaywrightLocation } from '../playwright/types';
import { PomNode } from './decorators/pomGraph';

export type StepConfig = {
  keyword: GherkinStepKeyword;
  pattern: DefineStepPattern;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => unknown;
  hasCustomTest: boolean;
  location: PlaywrightLocation;
  pomNode?: PomNode; // for decorator steps
  worldFixture?: string; // for new cucumber-style steps
};

// attach stepConfig to Cucumber step function
// to keep type of StepDefinition itself unchanged
export type CucumberStepFunction = TestStepFunction<BddWorld> & {
  stepConfig?: StepConfig;
};

export function getStepConfig(step: StepDefinition) {
  return (step.code as CucumberStepFunction).stepConfig;
}

/**
 * Decorator steps have pom node.
 */
export function isDecorator(
  stepConfig?: StepConfig,
): stepConfig is StepConfig & { pomNode: PomNode } {
  return Boolean(stepConfig?.pomNode);
}

/**
 * Step is defined via Given/When/Then from @cucumber/cucumber.
 */
export function isDefinedViaCucumber(stepConfig?: StepConfig): stepConfig is undefined {
  return !stepConfig;
}

/**
 * New cucumber-style steps have worldFixture in step config.
 */
export function isUsingWorldFixture(
  stepConfig?: StepConfig,
): stepConfig is StepConfig & { worldFixture: string } {
  return Boolean(stepConfig?.worldFixture);
}
