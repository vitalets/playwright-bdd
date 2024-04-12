/**
 * Stuff related to writing steps in Playwright-style.
 */

import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import {
  BuiltInFixtures,
  BuiltInFixturesWorker,
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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

// Global flag showing that custom test was passed.
// Used when checking 'importTestFrom' config option.
// todo: https://github.com/vitalets/playwright-bdd/issues/46
export let hasCustomTest = false;

export function createBdd<
  T extends KeyValue = BuiltInFixtures,
  W extends KeyValue = BuiltInFixturesWorker,
  World extends BddWorld = BddWorld,
>(customTest?: TestType<T, W> | null, _CustomWorld?: new (...args: any[]) => World) {
  if (!hasCustomTest) hasCustomTest = isCustomTest(customTest);
  const Given = defineStepCtor<T, W>('Given', hasCustomTest);
  const When = defineStepCtor<T, W>('When', hasCustomTest);
  const Then = defineStepCtor<T, W>('Then', hasCustomTest);
  const Step = defineStepCtor<T, W>('Unknown', hasCustomTest);
  const Before = scenarioHookFactory<T, W, World>('before');
  const After = scenarioHookFactory<T, W, World>('after');
  const BeforeAll = workerHookFactory<W>('beforeAll');
  const AfterAll = workerHookFactory<W>('afterAll');
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
