/**
 * New cucumber-style steps where Given/When/Then are not imported from Cucumber.
 * Instead they are imported as:
 * const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
 */
import { StepConfig } from '../stepConfig';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { registerStepDefinition } from '../registry';
import { BddAutoInjectFixtures } from '../../run/bddFixtures/autoInject';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CucumberStyleStepFn<World> = (this: World, ...args: any[]) => unknown;

export function cucumberStepCtor<StepFn extends StepConfig['fn']>(
  keyword: GherkinStepKeyword,
  worldFixture: string,
) {
  return (pattern: DefineStepPattern, fn: StepFn) => {
    const stepConfig: StepConfig = {
      keyword,
      pattern,
      fn,
      hasCustomTest: true,
      location: getLocationByOffset(3),
      worldFixture,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stepConfig.fn = ({ $bddContext }: BddAutoInjectFixtures, ...args: any[]) => {
      return fn.call($bddContext.world, ...args);
    };

    registerStepDefinition(stepConfig);

    // returns function to be able to call this step from other steps
    // see: https://github.com/vitalets/playwright-bdd/issues/110
    // Note: for new cucumber style we should call this fn with current world (add to docs)
    return fn;
  };
}
