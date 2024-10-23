/**
 * New cucumber-style steps where Given/When/Then are not imported from Cucumber.
 * Instead they are imported as:
 * const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
 */
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { registerStepDefinition } from '../registry';
import { BddAutoInjectFixtures } from '../../run/bddFixtures/autoInject';
import { TestTypeCommon } from '../../playwright/types';
import { DefineStepPattern, GherkinStepKeyword, StepDefinitionOptions } from '../stepDefinition';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CucumberStyleStepFn<World> = (this: World, ...args: any[]) => unknown;

export function cucumberStepCtor<StepFn extends StepDefinitionOptions['fn']>(
  keyword: GherkinStepKeyword,
  customTest: TestTypeCommon,
  worldFixture: string,
) {
  return (pattern: DefineStepPattern, fn: StepFn) => {
    registerStepDefinition({
      keyword,
      pattern,
      location: getLocationByOffset(3),
      customTest,
      worldFixture,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fn: ({ $bddContext }: BddAutoInjectFixtures, ...args: any[]) => {
        return fn.call($bddContext.world, ...args);
      },
    });

    // returns function to be able to call this step from other steps
    // see: https://github.com/vitalets/playwright-bdd/issues/110
    // Note: for new cucumber style we should call this fn with current world (add to docs)
    return fn;
  };
}
