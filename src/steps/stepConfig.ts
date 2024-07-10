/**
 * Playwright-bdd step config.
 */

import { PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { PomNode } from './decorators/pomGraph';
import { DefineStepPattern, GherkinStepKeyword } from './registry';

export type StepConfig = {
  keyword: GherkinStepKeyword;
  pattern: DefineStepPattern;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => unknown;
  location: PlaywrightLocation;
  customTest?: TestTypeCommon;
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
