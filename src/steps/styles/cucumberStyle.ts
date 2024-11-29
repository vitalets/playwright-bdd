/**
 * New cucumber-style steps where Given/When/Then are not imported from Cucumber.
 * Instead they are imported as:
 * const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
 */
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { registerStepDefinition } from '../stepRegistry';
import { BddAutoInjectFixtures } from '../../runtime/bddTestFixturesAuto';
import { AnyFunction, GherkinStepKeyword } from '../stepDefinition';
import { parseStepDefinitionArgs, StepConstructorOptions, StepDefinitionArgs } from './shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CucumberStyleStepFn<World> = (this: World, ...args: any[]) => unknown;

export type CucumberStyleStepCtor<T extends AnyFunction> = <StepFn extends T>(
  ...args: StepDefinitionArgs<StepFn>
) => StepFn;

export function cucumberStepCtor(
  keyword: GherkinStepKeyword,
  { customTest, worldFixture, defaultTags }: StepConstructorOptions,
) {
  return <StepFn extends AnyFunction>(...args: StepDefinitionArgs<StepFn>) => {
    const { pattern, providedOptions, fn } = parseStepDefinitionArgs(args);

    registerStepDefinition({
      keyword,
      pattern,
      location: getLocationByOffset(3),
      customTest,
      worldFixture,
      defaultTags,
      providedOptions,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fn: ({ $bddContext }: BddAutoInjectFixtures, ...args: any[]) => {
        return fn.call($bddContext.world, ...args);
      },
    });

    // returns function to be able to reuse this fn in other steps
    // see: https://github.com/vitalets/playwright-bdd/issues/110
    // Note: for cucumber style we should call this fn with current world
    // e.g.: fn.call(this, ...args)
    return fn;
  };
}
