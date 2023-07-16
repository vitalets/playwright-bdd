/**
 * Stuff related to writing steps in Playwright-style.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

import {
  Given as CucumberGiven,
  When as CucumberWhen,
  Then as CucumberThen,
} from '@cucumber/cucumber';
import {
  DefineStepPattern,
  IDefineStep,
  TestStepFunction,
} from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { World } from './world';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { FixturesArg, KeyValue, TestTypeCommon } from '../playwright/types';
import { TestInfo, TestType } from '@playwright/test';
import { exitWithMessage } from '../utils';
import { test as baseTest } from './baseTest';
import { isParentChildTest } from '../playwright/testTypeImpl';

export function createBdd<T extends KeyValue = {}, W extends KeyValue = {}>(
  customTest?: TestType<T, W>,
) {
  customTest = excludeBaseTest(customTest);
  assertCustomTestExtendsBdd(customTest);
  const Given = defineStep<T, W>(CucumberGiven, customTest);
  const When = defineStep<T, W>(CucumberWhen, customTest);
  const Then = defineStep<T, W>(CucumberThen, customTest);
  return { Given, When, Then };
}

// these fixtures automatically injected into step call
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
// extend Cucumber step function with some properties
export type CucumberStepFunction = TestStepFunction<World> & {
  fn?: Function;
  hasCustomTest?: boolean;
};

function defineStep<T extends KeyValue, W extends KeyValue = {}>(
  CucumberDefineStep: IDefineStep,
  customTest?: TestType<T, W>,
) {
  return (pattern: DefineStepPattern, fn: StepFunction<T, W>) => {
    const cucumberFn: CucumberStepFunction = function (...args: any[]) {
      const fixturesArg = Object.assign({}, this.customFixtures, {
        $testInfo: this.testInfo,
        $test: this.test,
        $tags: this.tags,
      });
      return fn.call(this, fixturesArg as StepFunctionFixturesArg<T, W>, ...args);
    };

    // store original fn to be able to extract fixture names
    cucumberFn.fn = fn;
    cucumberFn.hasCustomTest = Boolean(customTest);

    try {
      CucumberDefineStep(pattern, cucumberFn);
    } catch (e) {
      // todo: detect that this is import from test file
      // and skip/delay registering cucumber steps until cucumber is loaded
      const isMissingCucumber = /Cucumber that isn't running/i.test(e.message);
      if (isMissingCucumber) {
        exitWithMessage(
          `Option "importTestFrom" should point to separate file without step definitions`,
          `(e.g. without calls of Given, When, Then)`,
        );
      } else {
        throw e;
      }
    }
  };
}

const BDD_AUTO_FIXTURES: (keyof BddAutoFixtures)[] = ['$testInfo', '$test', '$tags'];
export function getFixtureNames(cucumberFn: CucumberStepFunction) {
  return fixtureParameterNames(cucumberFn.fn).filter((name) => {
    return !BDD_AUTO_FIXTURES.includes(name as keyof BddAutoFixtures);
  });
}

function assertCustomTestExtendsBdd(customTest?: TestTypeCommon) {
  if (customTest && !isParentChildTest(baseTest, customTest)) {
    exitWithMessage(`createBdd() should use test extended from "playwright-bdd"`);
  }
}

function excludeBaseTest<T extends KeyValue = {}, W extends KeyValue = {}>(
  customTest?: TestType<T, W>,
) {
  return customTest === (baseTest as TestTypeCommon) ? undefined : customTest;
}
