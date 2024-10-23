/**
 * Playwright-style steps.
 */
import { KeyValue, TestTypeCommon } from '../../playwright/types';
import { fixtureParameterNames } from '../../playwright/fixtureParameterNames';
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { ParametersExceptFirst } from '../../utils/types';
import { registerStepDefinition } from '../stepRegistry';
import { StepPattern, GherkinStepKeyword, StepDefinitionOptions } from '../stepDefinition';
import { parseStepDefinitionArgs, StepDefinitionArgs } from './shared';

export type PlaywrightStyleStepFn<T extends KeyValue, W extends KeyValue> = (
  fixtures: T & W,
  ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
) => unknown;

export function playwrightStepCtor<StepFn extends StepDefinitionOptions['fn']>(
  keyword: GherkinStepKeyword,
  customTest?: TestTypeCommon,
) {
  return (...args: StepDefinitionArgs<StepFn>) => {
    const { pattern, providedOptions, fn } = parseStepDefinitionArgs(args);

    registerStepDefinition({
      keyword,
      pattern,
      fn,
      location: getLocationByOffset(3),
      customTest,
      providedOptions,
    });

    return getCallableStepFn(pattern, fn);
  };
}

/**
 * Returns wrapped step function to be called from other steps.
 * See: https://github.com/vitalets/playwright-bdd/issues/110
 */
function getCallableStepFn<StepFn extends StepDefinitionOptions['fn']>(
  pattern: StepPattern,
  fn: StepFn,
) {
  // need Partial<...> here, otherwise TS requires all Playwright fixtures to be passed
  return (fixtures: Partial<Parameters<StepFn>[0]>, ...args: ParametersExceptFirst<StepFn>) => {
    assertStepIsCalledWithRequiredFixtures(pattern, fn, fixtures);
    return fn(fixtures, ...args);
  };
}

function assertStepIsCalledWithRequiredFixtures<StepFn extends StepDefinitionOptions['fn']>(
  pattern: StepPattern,
  fn: StepFn,
  passedFixtures: Partial<Parameters<StepFn>[0]>,
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
