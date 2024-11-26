/**
 * Test-scoped fixtures added by playwright-bdd.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { test as base } from './bddWorkerFixtures';
import { BDDConfig } from '../config/types';
import { getScenarioHooksToRun, runScenarioHooks } from '../hooks/scenario';
import { BddStepInvoker, BddStepFn } from './StepInvoker';
import { TestTypeCommon } from '../playwright/types';
import { TestInfo } from '@playwright/test';
import { BddTestData } from '../bddData/types';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

type BddStepFixture = {
  title: string;
};

// Hide all BDD fixtures in reporter.
// 'box' option was added in PW 1.46,
// make type coercion to satisfy TS in early PW versions
const fixtureOptions = { scope: 'test', box: true } as { scope: 'test' };

export type BddTestFixtures = {
  $bddContext: BddContext;
  Given: BddStepFn;
  When: BddStepFn;
  Then: BddStepFn;
  And: BddStepFn;
  But: BddStepFn;
  $bddFileData: BddTestData[];
  $bddTestData?: BddTestData; // $bddTestData is undefined for non-bdd tests
  $tags: string[];
  $test: TestTypeCommon;
  $testInfo: TestInfo;
  $step: BddStepFixture;
  $uri: string;
  $applySpecialTags: void;
  $world: unknown;
  $beforeEachFixtures: Record<string, unknown>;
  $beforeEach: void;
  $afterEachFixtures: Record<string, unknown>;
  $afterEach: void;
};

export type BddContext = {
  config: BDDConfig;
  featureUri: string;
  test: TestTypeCommon;
  testInfo: TestInfo;
  tags: string[];
  step: BddStepFixture;
  stepIndex: number; // step index in pickle (differs from index in scenario, b/c bg steps)
  world: unknown;
  bddTestData: BddTestData;
};

export const test = base.extend<BddTestFixtures>({
  // apply timeout and slow from special tags in runtime instead of generating in test body
  // to have cleaner test body and track fixtures in timeout calculation.
  $applySpecialTags: [
    async ({ $bddTestData }, use, testInfo) => {
      if ($bddTestData?.timeout !== undefined) testInfo.setTimeout($bddTestData.timeout);
      if ($bddTestData?.slow) testInfo.slow();
      await use();
    },
    fixtureOptions,
  ],
  $bddContext: [
    async ({ $tags, $test, $bddConfig, $bddTestData, $uri, $step, $world }, use, testInfo) => {
      if (!$bddTestData) {
        throw new Error('BDD fixtures can be used only in BDD tests');
      }

      await use({
        config: $bddConfig,
        featureUri: $uri,
        testInfo,
        test: $test,
        tags: $tags,
        step: $step,
        stepIndex: -1,
        world: $world,
        bddTestData: $bddTestData,
      });
    },
    fixtureOptions,
  ],

  // Unused fixtures below are important for lazy initialization only on bdd projects
  // See: https://github.com/vitalets/playwright-bdd/issues/166
  Given: [
    async ({ $bddContext, $applySpecialTags, $beforeEach }, use) => {
      const invoker = new BddStepInvoker($bddContext);
      await use(invoker.invoke.bind(invoker));
    },
    fixtureOptions,
  ],
  // All invoke step fixtures use the same Given fixture, b/c we get keyword from bddStepData
  When: [({ Given }, use) => use(Given), fixtureOptions],
  Then: [({ Given }, use) => use(Given), fixtureOptions],
  And: [({ Given }, use) => use(Given), fixtureOptions],
  But: [({ Given }, use) => use(Given), fixtureOptions],

  // For cucumber-style $world will be overwritten in test files
  // For playwright-style $world will be empty object
  // Note: although pw-style does not expect usage of world in steps,
  // some projects request it for better migration process from cucumber
  // See: https://github.com/vitalets/playwright-bdd/issues/208
  $world: [({}, use: (arg: unknown) => unknown) => use({}), fixtureOptions],

  // init $bddFileData with empty array, will be overwritten in each BDD test file
  $bddFileData: [({}, use) => use([]), fixtureOptions],

  // bddTestData for particular test
  $bddTestData: [
    async ({ $bddFileData }, use, testInfo) => {
      const bddTestData = $bddFileData.find((data) => data.pwTestLine === testInfo.line);
      await use(bddTestData);
    },
    fixtureOptions,
  ],

  // particular test tags
  $tags: [({ $bddTestData }, use) => use($bddTestData?.tags || []), fixtureOptions],

  // init $test with base test, but it will be overwritten in test file
  $test: [({}, use) => use(base), fixtureOptions],

  $testInfo: [({}, use, testInfo) => use(testInfo), fixtureOptions],

  // Info of the currently executed step.
  // Filled dynamically in step invoker.
  // Important to keep this fixture separate, without dependency on bddContext.
  // Otherwise we can get cyclic fixtures dependency.
  $step: [({}, use) => use({ title: '' }), fixtureOptions],

  // feature file uri, relative to configDir, will be overwritten in test file
  $uri: [({}, use) => use(''), fixtureOptions],

  // can be overwritten in test file if there are fixtures for beforeEach hooks
  $beforeEachFixtures: [({}, use) => use({}), fixtureOptions],
  // can be overwritten in test file if there are fixtures for afterEach hooks
  $afterEachFixtures: [({}, use) => use({}), fixtureOptions],
  // runs beforeEach hooks
  // unused dependency '$afterEach' is important to run afterEach
  // in case of error in beforeEach.
  $beforeEach: [
    async ({ $bddContext, $beforeEachFixtures, $tags, $afterEach }, use) => {
      const hooksToRun = getScenarioHooksToRun('before', $tags);
      await runScenarioHooks(hooksToRun, { $bddContext, ...$beforeEachFixtures });
      await use();
    },
    fixtureOptions,
  ],
  // runs afterEach hooks
  $afterEach: [
    async ({ $bddContext, $afterEachFixtures, $tags }, use) => {
      await use();
      const hooksToRun = getScenarioHooksToRun('after', $tags);
      hooksToRun.reverse();
      await runScenarioHooks(hooksToRun, { $bddContext, ...$afterEachFixtures });
    },
    fixtureOptions,
  ],
});
