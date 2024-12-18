/**
 * Playwright-style steps.
 */
import { KeyValue } from '../../playwright/types';
import { fixtureParameterNames } from '../../playwright/fixtureParameterNames';
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { ParametersExceptFirst } from '../../utils/types';
import { registerStepDefinition } from '../stepRegistry';
import { StepPattern, GherkinStepKeyword, AnyFunction } from '../stepDefinition';
import { parseStepDefinitionArgs, StepConstructorOptions, StepDefinitionArgs } from './shared';

export type PlaywrightStyleStepFn<T extends KeyValue, W extends KeyValue> = (
  // for ps-style we still pass world as {}
  // See: https://github.com/vitalets/playwright-bdd/issues/208
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: Record<string, any>,
  fixtures: T & W,
  ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
) => unknown;

export type PlaywrightStyleStepCtor<T extends AnyFunction> = <StepFn extends T>(
  ...args: StepDefinitionArgs<StepFn>
) => ReturnType<typeof getCallableStepFn<StepFn>>;

// typings here are vague, we set exact typings inside createBdd()
export function playwrightStepCtor(
  keyword: GherkinStepKeyword,
  { customTest, defaultTags }: StepConstructorOptions,
) {
  return <StepFn extends AnyFunction>(...args: StepDefinitionArgs<StepFn>) => {
    const { pattern, providedOptions, fn } = parseStepDefinitionArgs(args);

    registerStepDefinition({
      keyword,
      pattern,
      fn,
      location: getLocationByOffset(3),
      customTest,
      defaultTags,
      providedOptions,
    });

    return getCallableStepFn(pattern, fn);
  };
}

/**
 * Returns wrapped step function to be called from other steps.
 * See: https://github.com/vitalets/playwright-bdd/issues/110
 */
function getCallableStepFn<StepFn extends AnyFunction>(pattern: StepPattern, fn: StepFn) {
  // need Partial<...> here, otherwise TS requires _all_ Playwright fixtures to be passed
  type StepFnArguments =
    Parameters<StepFn> extends []
      ? []
      : [Partial<Parameters<StepFn>[0]>, ...ParametersExceptFirst<StepFn>];

  // todo: move default world type somewhere
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type DefaultWorld = any;

  return function (this: DefaultWorld, ...args: StepFnArguments) {
    const [fixtures, ...params] = args;
    assertStepIsCalledWithRequiredFixtures(pattern, fn, fixtures);
    return fn.call(this, fixtures, ...params);
  };
}

function assertStepIsCalledWithRequiredFixtures<StepFn extends AnyFunction>(
  pattern: StepPattern,
  fn: StepFn,
  passedFixtures: Record<string, unknown> = {},
) {
  const requiredFixtures = fixtureParameterNames(fn);
  const missingFixtures = requiredFixtures.filter(
    (fixtureName) => !Object.hasOwn(passedFixtures, fixtureName),
  );
  if (missingFixtures.length) {
    throw new Error(
      [
        `Invocation of step "${pattern}" from another step does not pass all required fixtures.`,
        `Missing fixtures: ${missingFixtures.join(', ')}`,
      ].join(' '),
    );
  }
}
