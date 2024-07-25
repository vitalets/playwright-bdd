/**
 * Test-scoped fixtures added by playwright-bdd.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { BddContextWorker, BddFixturesWorker, test as base } from './workerFixtures';
import { runScenarioHooks } from '../hooks/scenario';
import { createStepInvoker } from './invokeStep';
import { getTestMeta } from '../gen/testMeta';
import { getEnrichReporterData } from '../config/enrichReporterData';
import { SpecialTags } from '../specialTags';
import { TestTypeCommon } from '../playwright/types';
import { StepKeywordFixture } from './invokeStep';
import { TestMeta, TestMetaMap } from '../gen/testMeta';
import { TestInfo } from '@playwright/test';
import { BddDataManager } from './bddData';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

type StepFixture = {
  title: string;
};

export type BddFixtures = BddFixturesWorker & {
  $bddContext: BddContext;
  Given: StepKeywordFixture;
  When: StepKeywordFixture;
  Then: StepKeywordFixture;
  And: StepKeywordFixture;
  But: StepKeywordFixture;
  $testMetaMap: TestMetaMap;
  // testMeta is undefined for non-bdd tests
  $testMeta?: TestMeta;
  $tags: string[];
  $test: TestTypeCommon;
  $step: StepFixture;
  $uri: string;
  $scenarioHookFixtures: Record<string, unknown>;
  $before: void;
  $after: void;
  $lang: string;
  $applySpecialTags: void;
  $world: unknown;
};

export type BddContext = BddContextWorker & {
  test: TestTypeCommon;
  testInfo: TestInfo;
  lang: string;
  tags: string[];
  step: StepFixture;
  world: unknown;
  bddDataManager?: BddDataManager;
};

export const test = base.extend<BddFixtures>({
  // apply timeout and slow from special tags in runtime instead of generating in test body
  // to have cleaner test body and track fixtures in timeout calculation.
  $applySpecialTags: async ({ $testMeta }, use, testInfo) => {
    const specialTags = new SpecialTags($testMeta?.ownTags, $testMeta?.tags);
    if (specialTags.timeout !== undefined) testInfo.setTimeout(specialTags.timeout);
    if (specialTags.slow !== undefined) testInfo.slow();
    await use();
  },
  // $lang fixture can be overwritten in test file
  $lang: ({}, use) => use(''),
  $bddContext: async (
    { $tags, $test, $step, $bddContextWorker, $lang, $testMeta, $uri, $world },
    use,
    testInfo,
  ) => {
    const { config } = $bddContextWorker;

    const bddDataManager =
      $testMeta && getEnrichReporterData(config)
        ? new BddDataManager(testInfo, $testMeta, $uri)
        : undefined;

    await use({
      config,
      testInfo,
      test: $test,
      lang: $lang,
      tags: $tags,
      step: $step,
      world: $world,
      bddDataManager,
    });
  },

  // Unused fixtures below are important for lazy initialization only on bdd projects
  // See: https://github.com/vitalets/playwright-bdd/issues/166
  Given: ({ $bddContext, $before, $applySpecialTags }, use) =>
    use(createStepInvoker($bddContext, 'Given')),
  When: ({ $bddContext, $before, $applySpecialTags }, use) =>
    use(createStepInvoker($bddContext, 'When')),
  Then: ({ $bddContext, $before, $applySpecialTags }, use) =>
    use(createStepInvoker($bddContext, 'Then')),
  And: ({ $bddContext, $before, $applySpecialTags }, use) =>
    use(createStepInvoker($bddContext, 'And')),
  But: ({ $bddContext, $before, $applySpecialTags }, use) =>
    use(createStepInvoker($bddContext, 'But')),

  // Cucumber style world: null by default, can be overwritten in test files for cucumber style
  $world: ({}, use: (arg: unknown) => unknown) => use(null),

  // init $testMetaMap with empty object, will be overwritten in each BDD test file
  $testMetaMap: ({}, use) => use({}),

  // particular test meta
  $testMeta: ({ $testMetaMap }, use, testInfo) => use(getTestMeta($testMetaMap, testInfo)),

  // particular test tags
  $tags: ({ $testMeta }, use) => use($testMeta?.tags || []),

  // init $test with base test, but it will be overwritten in test file
  $test: ({}, use) => use(base),

  $step: ({}, use) => use({ title: '' }),

  // feature file uri, relative to configDir, will be overwritten in test file
  $uri: ({}, use) => use(''),

  // can be overwritten in test file if there are scenario hooks
  $scenarioHookFixtures: ({}, use) => use({}),
  $before:
    // Unused dependencies are important:
    // 1. $beforeAll / $afterAll: in pw < 1.39 worker-scoped auto-fixtures were called after test-scoped
    // 2. $after: to call after hooks in case of errors in before hooks
    async (
      { $scenarioHookFixtures, $bddContext, $tags, $beforeAll, $afterAll, $after },
      use,
      $testInfo,
    ) => {
      await runScenarioHooks('before', {
        $bddContext,
        $tags,
        $testInfo,
        ...$scenarioHookFixtures,
      });
      await use();
    },

  $after: async ({ $scenarioHookFixtures, $bddContext, $tags }, use, $testInfo) => {
    await use();
    await runScenarioHooks('after', {
      $bddContext,
      $tags,
      $testInfo,
      ...$scenarioHookFixtures,
    });
  },
});
