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
import { test as baseBddTest, BddTestFixtures } from '../runtime/bddTestFixtures';
import { isTestContainsSubtest } from '../playwright/testTypeImpl';
import { exit } from '../utils/exit';
import { createBeforeAfter } from '../hooks/scenario';
import { createBeforeAllAfterAll } from '../hooks/worker';
import { CucumberStyleStepFn, cucumberStepCtor } from './styles/cucumberStyle';
import { PlaywrightStyleStepFn, playwrightStepCtor } from './styles/playwrightStyle';
import { BddWorkerFixtures } from '../runtime/bddWorkerFixtures';

type CreateBddOptions<WorldFixtureName> = {
  worldFixture?: WorldFixtureName;
  tags?: string;
};

type DefaultFixturesTest = PwBuiltInFixturesTest & BddTestFixtures;
type DefaultFixturesWorker = PwBuiltInFixturesWorker & BddWorkerFixtures;
type CustomFixtureNames<T extends KeyValue> = Exclude<
  keyof T,
  keyof DefaultFixturesTest | number | symbol
>;

// eslint-disable-next-line max-statements, visual/complexity, max-lines-per-function
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

  // hooks and steps have the same constructor options
  const ctorOptions = {
    customTest,
    worldFixture: options?.worldFixture,
    defaultTags: options?.tags,
  };

  const BeforeAll = createBeforeAllAfterAll<W>('beforeAll', ctorOptions);
  const AfterAll = createBeforeAllAfterAll<W>('afterAll', ctorOptions);
  const Before = createBeforeAfter<T, W, World>('before', ctorOptions);
  const After = createBeforeAfter<T, W, World>('after', ctorOptions);

  // aliases
  const [BeforeWorker, AfterWorker] = [BeforeAll, AfterAll];
  const [BeforeScenario, AfterScenario] = [Before, After];

  // cucumber-style
  if (options && 'worldFixture' in options && options.worldFixture) {
    if (!customTest) {
      exit(`When using worldFixture, you should provide custom test to createBdd()`);
    }
    const Given = cucumberStepCtor('Given', ctorOptions) as StepCtor;
    const When = cucumberStepCtor('When', ctorOptions) as StepCtor;
    const Then = cucumberStepCtor('Then', ctorOptions) as StepCtor;
    const Step = cucumberStepCtor('Unknown', ctorOptions) as StepCtor;
    return {
      Given,
      When,
      Then,
      Step,
      Before,
      After,
      BeforeAll,
      AfterAll,
      BeforeWorker,
      AfterWorker,
      BeforeScenario,
      AfterScenario,
    };
  }

  // playwright-style
  const Given = playwrightStepCtor('Given', ctorOptions) as StepCtor;
  const When = playwrightStepCtor('When', ctorOptions) as StepCtor;
  const Then = playwrightStepCtor('Then', ctorOptions) as StepCtor;
  const Step = playwrightStepCtor('Unknown', ctorOptions) as StepCtor;

  return {
    BeforeAll,
    AfterAll,
    Before,
    After,
    Given,
    When,
    Then,
    Step,
    BeforeWorker,
    AfterWorker,
    BeforeScenario,
    AfterScenario,
  };
}

function assertTestHasBddFixtures(customTest: TestTypeCommon) {
  if (!isTestContainsSubtest(customTest, baseBddTest)) {
    exit(`createBdd() should use 'test' extended from "playwright-bdd"`);
  }
}
