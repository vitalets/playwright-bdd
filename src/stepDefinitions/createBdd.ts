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
import { BddAutoInjectFixtures, test as baseTest } from '../run/bddFixtures';
import { isParentChildTest } from '../playwright/testTypeImpl';
import { defineStep } from './defineStep';
import { exit } from '../utils/exit';
import { BddWorld } from '../run/BddWorld';
import { scenarioHookFactory } from '../hooks/scenario';
import { workerHookFactory } from '../hooks/worker';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

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
type StepFunction<T extends KeyValue, W extends KeyValue> = (
  fixtures: StepFunctionFixturesArg<T, W>,
  ...args: any[]
) => unknown;

function defineStepCtor<T extends KeyValue, W extends KeyValue = {}>(
  keyword: GherkinStepKeyword,
  hasCustomTest: boolean,
) {
  return (pattern: DefineStepPattern, fn: StepFunction<T, W>) => {
    defineStep({
      keyword,
      pattern,
      fn,
      hasCustomTest,
    });
  };
}

function isCustomTest<T extends KeyValue = {}, W extends KeyValue = {}>(
  customTest?: TestType<T, W> | null,
) {
  const isCustomTest = Boolean(customTest && customTest !== (baseTest as TestTypeCommon));
  if (isCustomTest && customTest && !isParentChildTest(baseTest, customTest)) {
    exit(`createBdd() should use test extended from "playwright-bdd"`);
  }
  return isCustomTest;
}
