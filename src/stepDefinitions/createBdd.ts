/**
 * Stuff related to writing steps in Playwright-style.
 */

import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { FixturesArg, KeyValue, TestTypeCommon } from '../playwright/types';
import { TestType } from '@playwright/test';
import {
  BddAutoInjectFixtures,
  test as baseTest,
  isBddAutoInjectFixture,
} from '../run/bddFixtures';
import { isParentChildTest } from '../playwright/testTypeImpl';
import { defineStep } from './defineStep';
import { exit } from '../utils/exit';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

export function createBdd<T extends KeyValue = {}, W extends KeyValue = {}>(
  customTest?: TestType<T, W>,
) {
  const hasCustomTest = isCustomTest(customTest);
  const Given = defineStepCtor<T, W>('Given', hasCustomTest);
  const When = defineStepCtor<T, W>('When', hasCustomTest);
  const Then = defineStepCtor<T, W>('Then', hasCustomTest);
  const Step = defineStepCtor<T, W>('Unknown', hasCustomTest);
  return { Given, When, Then, Step };
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

export function extractFixtureNames(fn?: Function) {
  return fixtureParameterNames(fn).filter((name) => !isBddAutoInjectFixture(name));
}

function isCustomTest<T extends KeyValue = {}, W extends KeyValue = {}>(
  customTest?: TestType<T, W>,
) {
  const isCustomTest = Boolean(customTest && customTest !== (baseTest as TestTypeCommon));
  // TODO re-enable
  // if (isCustomTest && customTest && !isParentChildTest(baseTest, customTest)) {
  //   exit(`createBdd() should use test extended from "playwright-bdd"`);
  // }
  return isCustomTest;
}
