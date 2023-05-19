import { PickleStep } from '@cucumber/messages';
import { ITestCaseHookParameter } from '@cucumber/cucumber';
import { World } from './world';
import { findStepDefinition } from '../cucumber/steps';

// eslint-disable-next-line max-params
export async function invokeStep(world: World, text: string, argument?: unknown, customFixtures?: unknown) {
  const stepDefinition = findStepDefinition(world.options.supportCodeLibrary, text);
  const { parameters } = await stepDefinition.getInvocationParameters({
    hookParameter: {} as ITestCaseHookParameter,
    step: { text, argument } as PickleStep,
    world,
  });
  // attach custom fixtures to world to pass them to step fn
  world.customFixtures = customFixtures;
  const res = await stepDefinition.code.apply(world, parameters);
  delete world.customFixtures;
  return res;
}
