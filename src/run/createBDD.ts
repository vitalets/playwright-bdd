/**
 * Stuff related to writing steps in Playwright-style.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

import { Given as CucumberGiven, When as CucumberWhen, Then as CucumberThen } from '@cucumber/cucumber';
import { DefineStepPattern, IDefineStep } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { World } from './world';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { FixturesArg, KeyValue } from '../playwright/types';
import { TestInfo, TestType } from '@playwright/test';

export const stepFixtureNames = new Map<Function, string[]>();

export function createBDD<T extends KeyValue = {}, W extends KeyValue = {}>(_test?: TestType<T, W>) {
  // todo: check that test was imported from playwright-bdd not from @playwright/test?
  const Given = defineStep<T, W>(CucumberGiven);
  const When = defineStep<T, W>(CucumberWhen);
  const Then = defineStep<T, W>(CucumberThen);
  return { Given, When, Then };
}

function defineStep<T extends KeyValue, W extends KeyValue = {}>(CucumberStepFn: IDefineStep) {
  type StepFunctionFixturesArg = FixturesArg<T, W> & { testInfo: TestInfo };
  type StepFunction = (fixtures: StepFunctionFixturesArg, ...args: any[]) => unknown;
  return (pattern: DefineStepPattern, fn: StepFunction) => {
    // testInfo is treated like a special fixture
    const fixtureNames = fixtureParameterNames(fn).filter((name) => name !== 'testInfo');
    const cucumberFn = function (this: World, ...args: any[]) {
      const fixturesArg = Object.assign({}, this.customFixtures, { testInfo: this.testInfo });
      return fn.call(this, fixturesArg as StepFunctionFixturesArg, ...args);
    };
    stepFixtureNames.set(cucumberFn, fixtureNames);
    return CucumberStepFn(pattern, cucumberFn);
  };
}
