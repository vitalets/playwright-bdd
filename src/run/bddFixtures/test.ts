/**
 * Test-scoped fixtures added by playwright-bdd.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { test as base } from './worker';
import { BDDConfig } from '../../config/types';
import { runScenarioHooks } from '../../hooks/scenario';
import { createStepInvoker } from '../invokeStep';
import { BddFileMeta, BddTestMeta, getBddTestMeta } from '../../gen/bddMeta';
import { getEnrichReporterData } from '../../config/enrichReporterData';
import { SpecialTags } from '../../specialTags';
import { TestTypeCommon } from '../../playwright/types';
import { StepKeywordFixture } from '../invokeStep';
import { TestInfo } from '@playwright/test';
import { BddAnnotation } from '../bddAnnotation';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

type StepFixture = {
  title: string;
};

export type BddFixturesTest = {
  $bddContext: BddContext;
  Given: StepKeywordFixture;
  When: StepKeywordFixture;
  Then: StepKeywordFixture;
  And: StepKeywordFixture;
  But: StepKeywordFixture;
  $bddFileMeta: BddFileMeta;
  $bddTestMeta?: BddTestMeta; // $bddTestMeta is undefined for non-bdd tests
  $tags: string[];
  $test: TestTypeCommon;
  $testInfo: TestInfo;
  $step: StepFixture;
  $uri: string;
  $scenarioHookFixtures: Record<string, unknown>;
  $before: void;
  $after: void;
  $lang: string;
  $applySpecialTags: void;
  $world: unknown;
};

export type BddContext = {
  config: BDDConfig;
  test: TestTypeCommon;
  testInfo: TestInfo;
  lang: string;
  tags: string[];
  step: StepFixture;
  world: unknown;
  bddAnnotation?: BddAnnotation;
};

export const test = base.extend<BddFixturesTest>({
  // apply timeout and slow from special tags in runtime instead of generating in test body
  // to have cleaner test body and track fixtures in timeout calculation.
  $applySpecialTags: async ({ $bddTestMeta }, use, testInfo) => {
    const specialTags = new SpecialTags($bddTestMeta?.ownTags, $bddTestMeta?.tags);
    if (specialTags.timeout !== undefined) testInfo.setTimeout(specialTags.timeout);
    if (specialTags.slow !== undefined) testInfo.slow();
    await use();
  },
  // $lang fixture can be overwritten in test file
  $lang: ({}, use) => use(''),
  $bddContext: async (
    { $tags, $test, $step, $bddConfig, $lang, $bddTestMeta, $uri, $world },
    use,
    testInfo,
  ) => {
    const bddAnnotation =
      $bddTestMeta && getEnrichReporterData($bddConfig)
        ? new BddAnnotation(testInfo, $bddTestMeta, $uri)
        : undefined;

    await use({
      config: $bddConfig,
      testInfo,
      test: $test,
      lang: $lang,
      tags: $tags,
      step: $step,
      world: $world,
      bddAnnotation,
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

  // For cucumber-style $world will be overwritten in test files
  // For playwright-style $world will be empty object
  // Note: although pw-style does not expect usage of world / this in steps,
  // some projects request it for better migration process from cucumber
  // See: https://github.com/vitalets/playwright-bdd/issues/208
  $world: ({}, use: (arg: unknown) => unknown) => use({}),

  // init $bddFileMeta with empty object, will be overwritten in each BDD test file
  $bddFileMeta: ({}, use) => use({}),

  // particular test meta
  $bddTestMeta: ({ $bddFileMeta }, use, testInfo) => use(getBddTestMeta($bddFileMeta, testInfo)),

  // particular test tags
  $tags: ({ $bddTestMeta }, use) => use($bddTestMeta?.tags || []),

  // init $test with base test, but it will be overwritten in test file
  $test: ({}, use) => use(base),

  $testInfo: ({}, use, testInfo) => use(testInfo),

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
