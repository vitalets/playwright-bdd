/**
 * Stuff related to writing steps in Playwright-style.
 */

import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import {
  BuiltInFixtures,
  BuiltInFixturesWorker,
  CustomFixtures,
  FixturesArg,
  KeyValue,
  TestTypeCommon,
} from '../playwright/types';
import { TestType } from '@playwright/test';
import { test as baseBddTest } from '../run/bddFixtures';
import { isTestContainsSubtest } from '../playwright/testTypeImpl';
import { defineStep } from './defineStep';
import { exit } from '../utils/exit';
import { BddWorld } from '../run/bddWorld';
import { scenarioHookFactory } from '../hooks/scenario';
import { workerHookFactory } from '../hooks/worker';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { BddAutoInjectFixtures } from '../run/bddFixtures/autoInject';
import { getLocationByOffset } from '../playwright/getLocationInFile';
import { defineStepCtorNewStyle } from './newCucumberStyleSteps';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

// Global flag showing that custom test was passed.
// Used when checking 'importTestFrom' config option.
// todo: https://github.com/vitalets/playwright-bdd/issues/46
export let hasCustomTest = false;

type CreateBddOptions<WorldFixture> = {
  worldFixture?: WorldFixture;
};

// eslint-disable-next-line max-statements, complexity
export function createBdd<
  T extends KeyValue = BuiltInFixtures,
  W extends KeyValue = BuiltInFixturesWorker,
  World extends BddWorld = BddWorld,
  WorldFixture extends keyof CustomFixtures<T> | undefined = undefined,
>(
  customTest?: TestType<T, W> | null,
  options?: CreateBddOptions<WorldFixture> | (new (...args: any[]) => World),
) {
  if (options instanceof BddWorld) {
    // warning
  }
  if (!hasCustomTest) hasCustomTest = isCustomTest(customTest);
  const BeforeAll = workerHookFactory<W>('beforeAll');
  const AfterAll = workerHookFactory<W>('afterAll');

  // new cucumber-style
  if (options && 'worldFixture' in options && options.worldFixture) {
    type NonNullableWorldFixture = typeof options.worldFixture;
    type NewStyleWorld = CustomFixtures<T>[NonNullableWorldFixture];
    const Given = defineStepCtorNewStyle<T, NonNullableWorldFixture>('Given', options.worldFixture);
    const When = defineStepCtorNewStyle<T, NonNullableWorldFixture>('When', options.worldFixture);
    const Then = defineStepCtorNewStyle<T, NonNullableWorldFixture>('Then', options.worldFixture);
    const Step = defineStepCtorNewStyle<T, NonNullableWorldFixture>(
      'Unknown',
      options.worldFixture,
    );
    const Before = scenarioHookFactory<T, W, NewStyleWorld>('before', {
      useWorldFromFixtures: true,
    });
    const After = scenarioHookFactory<T, W, NewStyleWorld>('after', { useWorldFromFixtures: true });
    return { Given, When, Then, Step, Before, After, BeforeAll, AfterAll };
  }

  const Given = defineStepCtor<T, W>('Given', hasCustomTest);
  const When = defineStepCtor<T, W>('When', hasCustomTest);
  const Then = defineStepCtor<T, W>('Then', hasCustomTest);
  const Step = defineStepCtor<T, W>('Unknown', hasCustomTest);
  const Before = scenarioHookFactory<T, W, World>('before');
  const After = scenarioHookFactory<T, W, World>('after');
  return { Given, When, Then, Step, Before, After, BeforeAll, AfterAll };
}

type StepFunctionFixturesArg<T extends KeyValue, W extends KeyValue> = FixturesArg<T, W> &
  BddAutoInjectFixtures;
type StepFunction<T extends KeyValue, W extends KeyValue, Args extends any[]> = (
  fixtures: StepFunctionFixturesArg<T, W>,
  ...args: Args
) => unknown;

function defineStepCtor<T extends KeyValue, W extends KeyValue = {}>(
  keyword: GherkinStepKeyword,
  hasCustomTest: boolean,
) {
  return <Args extends any[]>(pattern: DefineStepPattern, fn: StepFunction<T, W, Args>) => {
    defineStep({
      keyword,
      pattern,
      fn,
      hasCustomTest,
      location: getLocationByOffset(3),
    });
    // returns function to be able to call this step from other steps
    // see: https://github.com/vitalets/playwright-bdd/issues/110
    return (fixtures: Partial<StepFunctionFixturesArg<T, W>>, ...args: Args) => {
      assertStepIsCalledWithRequiredFixtures(pattern, fn, fixtures);
      return fn(fixtures as StepFunctionFixturesArg<T, W>, ...args);
    };
  };
}

function isCustomTest(customTest?: TestTypeCommon | null) {
  if (!customTest || customTest === (baseBddTest as TestTypeCommon)) return false;
  assertTestHasBddFixtures(customTest);
  return true;
}

function assertTestHasBddFixtures(customTest: TestTypeCommon) {
  if (!isTestContainsSubtest(customTest, baseBddTest)) {
    exit(`createBdd() should use 'test' extended from "playwright-bdd"`);
  }
}

function assertStepIsCalledWithRequiredFixtures<
  T extends KeyValue,
  W extends KeyValue,
  Args extends any[],
>(
  pattern: DefineStepPattern,
  fn: StepFunction<T, W, Args>,
  fixtures: Partial<StepFunctionFixturesArg<T, W>>,
) {
  const fixtureNames = fixtureParameterNames(fn);
  const missingFixtures = fixtureNames.filter(
    (fixtureName) => !Object.prototype.hasOwnProperty.call(fixtures, fixtureName),
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
