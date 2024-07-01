/**
 * createBdd() definition.
 */
import {
  BuiltInFixtures,
  BuiltInFixturesWorker,
  CustomFixtures,
  KeyValue,
  TestTypeCommon,
} from '../playwright/types';
import { TestType } from '@playwright/test';
import { test as baseBddTest } from '../run/testFixtures';
import { isTestContainsSubtest } from '../playwright/testTypeImpl';
import { exit } from '../utils/exit';
import { scenarioHookFactory } from '../hooks/scenario';
import { workerHookFactory } from '../hooks/worker';
import { CucumberStyleStepFn, cucumberStepCtor } from './cucumberStyle';
import { PlaywrightStyleStepFn, playwrightStepCtor } from './playwrightStyle';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

type CreateBddOptions<WorldFixtureName> = {
  worldFixture?: WorldFixtureName;
};

// eslint-disable-next-line max-statements, complexity
export function createBdd<
  T extends KeyValue = BuiltInFixtures,
  W extends KeyValue = BuiltInFixturesWorker,
  // important to set default value to empty string, not null or undefined
  // otherwise it breaks TS non-strict mode
  // see: https://github.com/vitalets/playwright-bdd/issues/163
  WorldFixtureName extends keyof CustomFixtures<T> | '' = '',
>(customTest?: TestType<T, W>, options?: CreateBddOptions<WorldFixtureName>) {
  // TypeScript does not narrow generic types by control flow
  // see: https://github.com/microsoft/TypeScript/issues/33912
  // So, we define return types separately using conditional types
  type World = WorldFixtureName extends keyof CustomFixtures<T>
    ? CustomFixtures<T>[WorldFixtureName]
    : null;

  type StepFn = WorldFixtureName extends keyof CustomFixtures<T>
    ? CucumberStyleStepFn<World>
    : PlaywrightStyleStepFn<T, W>;

  type StepCtor = WorldFixtureName extends keyof CustomFixtures<T>
    ? ReturnType<typeof cucumberStepCtor<StepFn>>
    : ReturnType<typeof playwrightStepCtor<StepFn>>;

  if (customTest === (baseBddTest as TestTypeCommon)) customTest = undefined;
  if (customTest) assertTestHasBddFixtures(customTest);

  const BeforeAll = workerHookFactory<W>('beforeAll');
  const AfterAll = workerHookFactory<W>('afterAll');
  const Before = scenarioHookFactory<T, W, World>('before');
  const After = scenarioHookFactory<T, W, World>('after');

  // cucumber-style
  if (options && 'worldFixture' in options && options.worldFixture) {
    if (!customTest) {
      exit(`When using worldFixture, you should provide custom test to createBdd()`);
    }
    const Given = cucumberStepCtor('Given', customTest, options.worldFixture) as StepCtor;
    const When = cucumberStepCtor('When', customTest, options.worldFixture) as StepCtor;
    const Then = cucumberStepCtor('Then', customTest, options.worldFixture) as StepCtor;
    const Step = cucumberStepCtor('Unknown', customTest, options.worldFixture) as StepCtor;
    return { Given, When, Then, Step, Before, After, BeforeAll, AfterAll };
  }

  // playwright-style
  const Given = playwrightStepCtor('Given', customTest) as StepCtor;
  const When = playwrightStepCtor('When', customTest) as StepCtor;
  const Then = playwrightStepCtor('Then', customTest) as StepCtor;
  const Step = playwrightStepCtor('Unknown', customTest) as StepCtor;
  return { Given, When, Then, Step, Before, After, BeforeAll, AfterAll };
}

function assertTestHasBddFixtures(customTest: TestTypeCommon) {
  if (!isTestContainsSubtest(customTest, baseBddTest)) {
    exit(`createBdd() should use 'test' extended from "playwright-bdd"`);
  }
}
