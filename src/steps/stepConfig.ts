/**
 * Playwright-bdd's step config.
 */

import { PlaywrightLocation } from '../playwright/types';
import { PomNode } from './decorators/pomGraph';
import { GherkinStepKeyword } from '../cucumber/types';

export type StepConfig = {
  keyword: GherkinStepKeyword;
  pattern: string | RegExp;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => unknown;
  hasCustomTest: boolean;
  location: PlaywrightLocation;
  pomNode?: PomNode; // for decorator steps
  worldFixture?: string; // for new cucumber-style steps
};

/**
 * Decorator steps have pom node.
 */
export function isDecorator(
  stepConfig?: StepConfig,
): stepConfig is StepConfig & { pomNode: PomNode } {
  return Boolean(stepConfig?.pomNode);
}

/**
 * New cucumber-style steps have worldFixture in step config.
 */
export function isCucumberStyleStep(
  stepConfig?: StepConfig,
): stepConfig is StepConfig & { worldFixture: string } {
  return Boolean(stepConfig?.worldFixture);
}
