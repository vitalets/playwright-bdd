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
  // eslint-disable-next-line @typescript-eslint/ban-types
  fn: Function;
  hasCustomTest: boolean;
  location: PlaywrightLocation;
  pomNode?: PomNode; // for decorator steps
};

// attach stepConfig to Cucumber step function
// to keep type of StepDefinition itself unchanged
export type CucumberStepFunction = TestStepFunction<BddWorld> & {
  stepConfig?: StepConfig;
};

export function getStepConfig(step: StepDefinition) {
  return (step.code as CucumberStepFunction).stepConfig;
}

export function isDecorator(
  stepConfig?: StepConfig,
): stepConfig is StepConfig & { pomNode: PomNode } {
  return Boolean(stepConfig?.pomNode);
}

/**
 * Cucumber-style steps don't have stepConfig
 * b/c they created directly via cucumber's Given, When, Then.
 */
export function isPlaywrightStyle(stepConfig?: StepConfig): stepConfig is StepConfig {
  return Boolean(stepConfig);
}
