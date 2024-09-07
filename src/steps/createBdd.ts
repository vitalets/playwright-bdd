/**
 * createBdd() definition.
 */
import {
  PwBuiltInFixturesTest,
  PwBuiltInFixturesWorker,
  KeyValue,
  TestTypeCommon,
} from '../playwright/types';
import { TestType } from '@playwright/test';
import { test as baseBddTest, BddFixturesTest } from '../run/bddFixtures/test';
import { isTestContainsSubtest } from '../playwright/testTypeImpl';
import { exit } from '../utils/exit';
import { scenarioHookFactory } from '../hooks/scenario';
import { workerHookFactory } from '../hooks/worker';
import { CucumberStyleStepFn, cucumberStepCtor } from './cucumberStyle';
import { PlaywrightStyleStepFn, playwrightStepCtor } from './playwrightStyle';
import { BddFixturesWorker } from '../run/bddFixtures/worker';

type CreateBddOptions<WorldFixtureName> = {
  worldFixture?: WorldFixtureName;
};

type DefaultFixturesTest = PwBuiltInFixturesTest & BddFixturesTest;
type DefaultFixturesWorker = PwBuiltInFixturesWorker & BddFixturesWorker;
type CustomFixtureNames<T extends KeyValue> = Exclude<
  keyof T,
  keyof DefaultFixturesTest | number | symbol
>;

// eslint-disable-next-line max-statements, visual/complexity
export function createBdd<
  T extends KeyValue = DefaultFixturesTest,
  W extends KeyValue = DefaultFixturesWorker,
  // important to set default value to empty string, not null or undefined
  // otherwise it breaks TS non-strict mode
  // see: https://github.com/vitalets/playwright-bdd/issues/163
  WorldFixtureName extends CustomFixtureNames<T> | '' = '',
>(customTest?: TestType<T, W>, options?: CreateBddOptions<WorldFixtureName>) {
  // TypeScript does not narrow generic types by control flow
  // see: https://github.com/microsoft/TypeScript/issues/33912
  // So, we define return types separately using conditional types
  type World =
    WorldFixtureName extends CustomFixtureNames<T>
      ? T[WorldFixtureName] // prettier-ignore
      : null;

  type StepFn =
    WorldFixtureName extends CustomFixtureNames<T>
      ? CucumberStyleStepFn<World>
      : PlaywrightStyleStepFn<T, W>;

  type StepCtor =
    WorldFixtureName extends CustomFixtureNames<T>
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
