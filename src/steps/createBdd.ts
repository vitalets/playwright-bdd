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
import { test as baseBddTest } from '../run/bddFixtures';
import { isTestContainsSubtest } from '../playwright/testTypeImpl';
import { exit } from '../utils/exit';
import { BddWorld } from '../run/bddWorld';
import { scenarioHookFactory } from '../hooks/scenario';
import { workerHookFactory } from '../hooks/worker';
import { CucumberStyleStepFn, cucumberStepCtor } from './cucumberStyle';
import { PlaywrightStyleStepFn, playwrightStepCtor } from './playwrightStyle';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

// Global flag showing that custom test was passed.
// Used when checking 'importTestFrom' config option.
// todo: https://github.com/vitalets/playwright-bdd/issues/46
export let hasCustomTest = false;

type CreateBddOptions<WorldFixtureName> = {
  worldFixture?: WorldFixtureName;
};

// eslint-disable-next-line max-statements, complexity
export function createBdd<
  T extends KeyValue = BuiltInFixtures,
  W extends KeyValue = BuiltInFixturesWorker,
  CustomWorld extends BddWorld = BddWorld,
  // important to set default value to empty string, not null or undefined
  // otherwise it breaks TS non-strict mode
  // see: https://github.com/vitalets/playwright-bdd/issues/163
  WorldFixtureName extends keyof CustomFixtures<T> | '' = '',
>(
  customTest?: TestType<T, W> | null,
  options?: CreateBddOptions<WorldFixtureName> | (new (...args: any[]) => CustomWorld),
) {
  // TypeScript does not narrow generic types by control flow
  // see: https://github.com/microsoft/TypeScript/issues/33912
  // So, we define return types separately using conditional types
  type World = WorldFixtureName extends keyof CustomFixtures<T>
    ? CustomFixtures<T>[WorldFixtureName]
    : CustomWorld;

  type StepFn = WorldFixtureName extends keyof CustomFixtures<T>
    ? CucumberStyleStepFn<World>
    : PlaywrightStyleStepFn<T, W>;

  type StepCtor = WorldFixtureName extends keyof CustomFixtures<T>
    ? ReturnType<typeof cucumberStepCtor<StepFn>>
    : ReturnType<typeof playwrightStepCtor<StepFn>>;

  if (options instanceof BddWorld) {
    // todo: deprecation warning
  }

  if (!hasCustomTest) hasCustomTest = isCustomTest(customTest);

  const BeforeAll = workerHookFactory<W>('beforeAll');
  const AfterAll = workerHookFactory<W>('afterAll');

  // new cucumber-style
  if (options && 'worldFixture' in options && options.worldFixture) {
    if (!hasCustomTest) {
      exit(`When using worldFixture, you should provide custom test to createBdd()`);
    }
    const Given = cucumberStepCtor('Given', options.worldFixture) as StepCtor;
    const When = cucumberStepCtor('When', options.worldFixture) as StepCtor;
    const Then = cucumberStepCtor('Then', options.worldFixture) as StepCtor;
    const Step = cucumberStepCtor('Unknown', options.worldFixture) as StepCtor;
    const Before = scenarioHookFactory<T, W, World>('before', { useWorldFixture: true });
    const After = scenarioHookFactory<T, W, World>('after', { useWorldFixture: true });
    return { Given, When, Then, Step, Before, After, BeforeAll, AfterAll };
  }

  const Given = playwrightStepCtor('Given', hasCustomTest) as StepCtor;
  const When = playwrightStepCtor('When', hasCustomTest) as StepCtor;
  const Then = playwrightStepCtor('Then', hasCustomTest) as StepCtor;
  const Step = playwrightStepCtor('Unknown', hasCustomTest) as StepCtor;
  const Before = scenarioHookFactory<T, W, World>('before');
  const After = scenarioHookFactory<T, W, World>('after');
  return { Given, When, Then, Step, Before, After, BeforeAll, AfterAll };
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
