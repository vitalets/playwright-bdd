/**
 * Stuff related to writing steps in Playwright-style.
 */

import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { FixturesArg, KeyValue, TestTypeCommon } from '../playwright/types';
import { TestInfo, TestType } from '@playwright/test';
import { exitWithMessage } from '../utils';
import { test as baseTest } from '../run/baseTest';
import { isParentChildTest } from '../playwright/testTypeImpl';
import { defineStep } from './defineStep';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

export function createBdd<T extends KeyValue = {}, W extends KeyValue = {}>(
  customTest?: TestType<T, W>,
) {
  const hasCustomTest = isCustomTest(customTest);
  const Given = defineStepCtor<T, W>('Given', hasCustomTest);
  const When = defineStepCtor<T, W>('When', hasCustomTest);
  const Then = defineStepCtor<T, W>('Then', hasCustomTest);
  return { Given, When, Then };
}

// these fixtures automatically injected into every step call
type BddAutoFixtures = {
  $testInfo: TestInfo; // todo: deprecate $testInfo in favor of $test.info()
  $test: TestTypeCommon;
  $tags: string[];
};

type StepFunctionFixturesArg<T extends KeyValue, W extends KeyValue> = FixturesArg<T, W> &
  BddAutoFixtures;
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
      isDecorator: false,
      possibleFixtureNames: [],
    });
  };
}

const BDD_AUTO_FIXTURES: (keyof BddAutoFixtures)[] = ['$testInfo', '$test', '$tags'];
export function extractFixtureNames(fn?: Function) {
  return fixtureParameterNames(fn).filter((name) => {
    return !BDD_AUTO_FIXTURES.includes(name as keyof BddAutoFixtures);
  });
}

function isCustomTest<T extends KeyValue = {}, W extends KeyValue = {}>(
  customTest?: TestType<T, W>,
) {
  const isCustomTest = Boolean(customTest && customTest !== (baseTest as TestTypeCommon));
  if (isCustomTest && customTest && !isParentChildTest(baseTest, customTest)) {
    exitWithMessage(`createBdd() should use test extended from "playwright-bdd"`);
  }
  return isCustomTest;
}
