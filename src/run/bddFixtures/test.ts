/**
 * Test-scoped fixtures added by playwright-bdd.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { test as base } from './worker';
import { BDDConfig } from '../../config/types';
import { runScenarioHooks, ScenarioHookType } from '../../hooks/scenario';
import { createStepInvoker, StepKeywordFixture } from '../StepInvoker';
import { BddFileMeta, BddTestMeta, getBddTestMeta } from '../../gen/bddMetaBuilder';
import { getEnrichReporterData } from '../../config/enrichReporterData';
import { SpecialTags } from '../../specialTags';
import { TestTypeCommon } from '../../playwright/types';
import { TestInfo } from '@playwright/test';
import { BddAnnotation } from '../../bddAnnotation';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

type StepFixture = {
  title: string;
};

// Hide all BDD fixtures in reporter.
// 'box' option was added in PW 1.46,
// make type coercion to satisfy TS in early PW versions
const fixtureOptions = { scope: 'test', box: true } as { scope: 'test' };

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
  step: StepFixture;
  stepIndex: number; // step index in pickle (differs from index in scenario, b/c bg steps)
  world: unknown;
  bddTestMeta: BddTestMeta;
  bddAnnotation?: BddAnnotation;
};

export const test = base.extend<BddFixturesTest>({
  // apply timeout and slow from special tags in runtime instead of generating in test body
  // to have cleaner test body and track fixtures in timeout calculation.
  $applySpecialTags: [
    async ({ $bddTestMeta }, use, testInfo) => {
      const specialTags = new SpecialTags($bddTestMeta?.ownTags, $bddTestMeta?.tags);
      if (specialTags.timeout !== undefined) testInfo.setTimeout(specialTags.timeout);
      if (specialTags.slow !== undefined) testInfo.slow();
      await use();
    },
    fixtureOptions,
  ],
  $bddContext: [
    async ({ $tags, $test, $bddConfig, $bddTestMeta, $uri, $step, $world }, use, testInfo) => {
      if (!$bddTestMeta) {
        throw new Error('BDD fixtures can be used only in BDD tests');
      }

      const bddAnnotation = getEnrichReporterData($bddConfig)
        ? new BddAnnotation(testInfo, $bddTestMeta, $uri)
        : undefined;

      await use({
        config: $bddConfig,
        featureUri: $uri,
        testInfo,
        test: $test,
        tags: $tags,
        step: $step,
        stepIndex: -1,
        world: $world,
        bddTestMeta: $bddTestMeta,
        bddAnnotation,
      });
    },
    fixtureOptions,
  ],

  // Unused fixtures below are important for lazy initialization only on bdd projects
  // See: https://github.com/vitalets/playwright-bdd/issues/166
  Given: [
    ({ $bddContext, $applySpecialTags, $beforeEach }, use) => use(createStepInvoker($bddContext)),
    fixtureOptions,
  ],
  // All invoke step fixtures use the same Given fixture, b/c we get keyword from step meta (by index)
  When: [({ Given }, use) => use(Given), fixtureOptions],
  Then: [({ Given }, use) => use(Given), fixtureOptions],
  And: [({ Given }, use) => use(Given), fixtureOptions],
  But: [({ Given }, use) => use(Given), fixtureOptions],

  // For cucumber-style $world will be overwritten in test files
  // For playwright-style $world will be empty object
  // Note: although pw-style does not expect usage of world / this in steps,
  // some projects request it for better migration process from cucumber
  // See: https://github.com/vitalets/playwright-bdd/issues/208
  $world: [({}, use: (arg: unknown) => unknown) => use({}), fixtureOptions],

  // init $bddFileMeta with empty object, will be overwritten in each BDD test file
  $bddFileMeta: [({}, use) => use({}), fixtureOptions],

  // particular test meta
  $bddTestMeta: [
    ({ $bddFileMeta }, use, testInfo) => use(getBddTestMeta($bddFileMeta, testInfo)),
    fixtureOptions,
  ],

  // particular test tags
  $tags: [({ $bddTestMeta }, use) => use($bddTestMeta?.tags || []), fixtureOptions],

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
    async ({ $bddContext, $beforeEachFixtures, $afterEach }, use) => {
      await runScenarioHooks('before', { $bddContext, ...$beforeEachFixtures });
      await use();
    },
    fixtureOptions,
  ],
  // runs afterEach hooks
  $afterEach: [
    async ({ $bddContext, $afterEachFixtures }, use) => {
      await use();
      await runScenarioHooks('after', { $bddContext, ...$afterEachFixtures });
    },
    fixtureOptions,
  ],
});
