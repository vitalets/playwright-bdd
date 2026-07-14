/**
 * New cucumber-style steps where Given/When/Then are not imported from Cucumber.
 * Instead they are imported as:
 * const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
 */
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { registerStepDefinition } from '../stepRegistry';
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
    const { patterns, providedOptions, fn } = parseStepDefinitionArgs(args);
    const location = getLocationByOffset(3);
    // Define the runtime wrapper once so all step patterns share the exact same implementation.
    // this wrappedFn is needed, because internally we always call fn with fixtures as a second arg.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrappedFn = function (this: unknown, _fixtures: unknown, ...args: any[]) {
      return fn.call(this, ...args);
    };

    patterns.forEach((pattern) => {
      registerStepDefinition({
        keyword,
        pattern,
        arity: fn.length,
        location,
        customTest,
        worldFixture,
        defaultTags,
        providedOptions,
        fn: wrappedFn,
      });
    });

    // returns function to be able to reuse this fn in other steps
    // see: https://github.com/vitalets/playwright-bdd/issues/110
    // Note: for cucumber style we should call this fn with current world
    // e.g.: fn.call(this, ...args)
    return fn;
  };
}
