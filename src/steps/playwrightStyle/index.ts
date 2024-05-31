/**
 * Playwright-style steps.
 */
import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { FixturesArg, KeyValue } from '../../playwright/types';
import { defineStep } from './defineStep';
import { fixtureParameterNames } from '../../playwright/fixtureParameterNames';
import { BddAutoInjectFixtures } from '../../run/bddFixtures/autoInject';
import { getLocationByOffset } from '../../playwright/getLocationInFile';
import { StepConfig } from '../stepConfig';
import { ParametersExceptFirst } from '../../utils/types';

export type PlaywrightStyleStepFn<T extends KeyValue, W extends KeyValue> = (
  fixtures: FixturesArg<T, W> & BddAutoInjectFixtures,
  ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
) => unknown;

export function playwrightStepCtor<StepFn extends StepConfig['fn']>(
  keyword: GherkinStepKeyword,
  hasCustomTest: boolean,
) {
  return (pattern: DefineStepPattern, fn: StepFn) => {
    defineStep({
      keyword,
      pattern,
      fn,
      hasCustomTest,
      location: getLocationByOffset(3),
    });

    return getCallableStepFn(pattern, fn);
  };
}

/**
 * Returns wrapped step function to be called from other steps.
 * See: https://github.com/vitalets/playwright-bdd/issues/110
 */
function getCallableStepFn<StepFn extends StepConfig['fn']>(
  pattern: DefineStepPattern,
  fn: StepFn,
) {
  // need Partial<...> here, otherwise TS requires all Playwright fixtures to be passed
  return (fixtures: Partial<Parameters<StepFn>[0]>, ...args: ParametersExceptFirst<StepFn>) => {
    assertStepIsCalledWithRequiredFixtures(pattern, fn, fixtures);
    return fn(fixtures, ...args);
  };
}

function assertStepIsCalledWithRequiredFixtures<StepFn extends StepConfig['fn']>(
  pattern: DefineStepPattern,
  fn: StepFn,
  passedFixtures: Partial<Parameters<StepFn>[0]>,
) {
  const requiredFixtures = fixtureParameterNames(fn);
  const missingFixtures = requiredFixtures.filter(
    (fixtureName) => !Object.prototype.hasOwnProperty.call(passedFixtures, fixtureName),
  );
  if (missingFixtures.length) {
    throw new Error(
      [
        `Invocation of step "${pattern}" from another step does not pass all required fixtures.`,
        `Missings fixtures: ${missingFixtures.join(', ')}`,
      ].join(' '),
    );
  }
}
