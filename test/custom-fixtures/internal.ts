/**
 * test.describe can't be async, https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/testType.ts#L130
 */

import {
  Fixtures,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
} from '@playwright/test';
import { test as base } from '../../src';
import { Given as CucumberGiven, When as CucumberWhen, Then as CucumberThen } from '@cucumber/cucumber';
import { DefineStepPattern, IDefineStep } from '@cucumber/cucumber/lib/support_code_library_builder/types';

// todo: make testInfo fixture
// type x = [PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions];
// type Fixtures = Parameters<Parameters<typeof base>[1]>[0];
// type StepFunction = (fixtures: Fixtures, ...args: any[]) => any | Promise<any>;

// export function myExtend() {
//   const Then = () => {};
//   return { Then };
// }

type KeyValue = { [key: string]: any };

let gTest;
let gFixtures;

export function createTest(fixtures: any) {
  // if (gTest) gTest = base.extend(fixtures);
  // return gTest;
}

export async function useFixture(name: string, deps: any, use: any, testInfo: any) {
  // await loadCucumber();
  // return gFixtures[name](deps, use, testInfo);
}

type PlaywrightFixtures<T extends KeyValue, W extends KeyValue = {}> = Fixtures<
  T,
  W,
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;

export function createBDD<T extends KeyValue, W extends KeyValue = {}>(fixtures: PlaywrightFixtures<T, W>) {
  // check that creatBDD is called once
  gFixtures = fixtures;
  const Given = defineStep<T, W>(CucumberGiven);
  const When = defineStep<T, W>(CucumberWhen);
  const Then = defineStep<T, W>(CucumberThen);
  return { Given, When, Then };
}

function defineStep<T extends KeyValue, W extends KeyValue = {}>(CucumberStepFn: IDefineStep) {
  type StepFunction = (fixtures: PlaywrightFixtures<T, W>, ...args: any[]) => any | Promise<any>;
  return (pattern: DefineStepPattern, fn: StepFunction) => {
    // parse fn.toString() to get fixture names and save for pattern + keyword
    return CucumberStepFn(pattern, function (...args: any[]) {
      return fn.call(this, this.customFixtures, ...args);
    });
  };
}
