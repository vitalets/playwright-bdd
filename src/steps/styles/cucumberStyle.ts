/**
 * New cucumber-style steps where Given/When/Then are not imported from Cucumber.
 * Instead they are imported as:
 * const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
 */
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { registerStepDefinition } from '../stepRegistry';
import {
  AnyFunction,
  GherkinStepKeyword,
  StepPattern,
  ProvidedStepOptions,
} from '../stepDefinition';
import { parseStepDefinitionArgs, StepConstructorOptions, StepDefinitionArgs } from './shared';
import { BddExpressionStepFn } from '../bddExpression/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CucumberStyleStepFn<World> = (this: World, ...args: any[]) => unknown;

export type CucumberStyleStepCtor<T extends AnyFunction, DefaultBddExpr extends boolean = false> = {
  <
    Pattern extends StepPattern,
    BddExpr extends boolean,
    StepFn extends BddExpressionStepFn<T, Pattern, BddExpr, 'cucumber'>,
  >(
    pattern: Pattern,
    options: ProvidedStepOptions & { bddExpr: BddExpr },
    fn: StepFn,
  ): StepFn;
  <
    Pattern extends StepPattern,
    StepFn extends BddExpressionStepFn<T, Pattern, DefaultBddExpr, 'cucumber'>,
  >(
    ...args:
      | [pattern: Pattern, fn: StepFn]
      | [pattern: Pattern, options: ProvidedStepOptions & { bddExpr?: DefaultBddExpr }, fn: StepFn]
  ): StepFn;
};

export function cucumberStepCtor(
  keyword: GherkinStepKeyword,
  { customTest, worldFixture, defaultTags, defaultBddExpr }: StepConstructorOptions,
) {
  return <StepFn extends AnyFunction>(...args: StepDefinitionArgs<StepFn>) => {
    const { pattern, providedOptions, fn } = parseStepDefinitionArgs(args);

    registerStepDefinition({
      keyword,
      pattern,
      arity: fn.length,
      location: getLocationByOffset(3),
      customTest,
      worldFixture,
      defaultTags,
      defaultBddExpr,
      providedOptions,
      // Here we define step function in Playwright-style,
      // and it internally calls the original cucumber-style function with world context.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fn: function (_fixtures: unknown, ...args: any[]) {
        return fn.call(this, ...args);
      },
    });

    // returns function to be able to reuse this fn in other steps
    // see: https://github.com/vitalets/playwright-bdd/issues/110
    // Note: for cucumber style we should call this fn with current world
    // e.g.: fn.call(this, ...args)
    return fn;
  };
}
