/**
 * Stuff related to writing steps in Playwright-style.
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

import { Given as CucumberGiven, When as CucumberWhen, Then as CucumberThen } from '@cucumber/cucumber';
import { DefineStepPattern, IDefineStep } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { World } from '../run/world';
import { fixtureParameterNames } from './fixtureParameterNames';
import { FixturesArg, FixturesDefinition, KeyValue } from './types';
import { TestInfo } from '@playwright/test';

export const customFixtures: FixturesDefinition = {};
export const stepFixtureNames = new Map<Function, string[]>();

export function createBDD<T extends KeyValue, W extends KeyValue = {}>(fixtures: FixturesDefinition<T, W>) {
  Object.assign(customFixtures, fixtures);
  const Given = defineStep<T, W>(CucumberGiven);
  const When = defineStep<T, W>(CucumberWhen);
  const Then = defineStep<T, W>(CucumberThen);
  return { Given, When, Then };
}

function defineStep<T extends KeyValue, W extends KeyValue = {}>(CucumberStepFn: IDefineStep) {
  type StepFunctionFixturesArg = FixturesArg<T, W> & { testInfo: TestInfo };
  type StepFunction = (fixtures: StepFunctionFixturesArg, ...args: any[]) => unknown;
  return (pattern: DefineStepPattern, fn: StepFunction) => {
    const fixtureNames = fixtureParameterNames(fn).filter((name) => name !== 'testInfo');
    const cucumberFn = function (this: World, ...args: any[]) {
      const fixturesArg = Object.assign({}, this.customFixtures, { testInfo: this.testInfo });
      return fn.call(this, fixturesArg as StepFunctionFixturesArg, ...args);
    };
    stepFixtureNames.set(cucumberFn, fixtureNames);
    return CucumberStepFn(pattern, cucumberFn);
  };
}
