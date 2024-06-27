import { test as base } from '@playwright/test';
import { getConfigFromEnv } from '../config/env';
import { getPlaywrightConfigDir } from '../config/configDir';
import { runScenarioHooks } from '../hooks/scenario';
import { runWorkerHooks } from '../hooks/worker';
import { createStepInvoker } from './StepInvoker';
import { getTestMeta } from '../gen/testMeta';
import { getEnrichReporterData } from '../config/enrichReporterData';
import { BddDataManager } from './bddData';
import { BddFixtures, BddFixturesWorker } from './types';
import { resolveAndLoadSteps } from '../cucumber/loadStepsOwn';
import { SpecialTags } from '../specialTags';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

export const test = base.extend<BddFixtures, BddFixturesWorker>({
  $bddContextWorker: [
    async ({}, use, workerInfo) => {
      const config = getConfigFromEnv(workerInfo.project.testDir);
      const cwd = getPlaywrightConfigDir();
      await resolveAndLoadSteps(cwd, config.steps);
      await use({ config });
    },
    { auto: true, scope: 'worker' },
  ],
  // apply timeout and slow from special tags in runtime instead of generating in test body
  // to have cleaner test body and track fixtures in timeout calculation.
  $applySpecialTags: [
    async ({ $testMeta }, use, testInfo) => {
      const specialTags = new SpecialTags($testMeta.ownTags, $testMeta.tags);
      if (specialTags.timeout !== undefined) testInfo.setTimeout(specialTags.timeout);
      if (specialTags.slow !== undefined) testInfo.slow();
      await use();
    },
    { auto: true },
  ],
  // $lang fixture can be overwritten in test file
  $lang: ({}, use) => use(''),
  $bddContext: async (
    { $tags, $test, $step, $bddContextWorker, $lang, $testMeta, $uri, $world },
    use,
    testInfo,
  ) => {
    const { config } = $bddContextWorker;

    const bddDataManager = getEnrichReporterData(config)
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

  Given: ({ $bddContext }, use) => use(createStepInvoker($bddContext, 'Given')),
  When: ({ $bddContext }, use) => use(createStepInvoker($bddContext, 'When')),
  Then: ({ $bddContext }, use) => use(createStepInvoker($bddContext, 'Then')),
  And: ({ $bddContext }, use) => use(createStepInvoker($bddContext, 'And')),
  But: ({ $bddContext }, use) => use(createStepInvoker($bddContext, 'But')),

  // Cucumber style world: null by default, can be overwritten in test files for cucumber style
  $world: ({}, use: (arg: unknown) => unknown) => use(null),

  // init $testMetaMap with empty object, will be overwritten in each test file
  $testMetaMap: ({}, use) => use({}),

  // concrete test meta
  $testMeta: ({ $testMetaMap }, use, testInfo) => use(getTestMeta($testMetaMap, testInfo)),

  // concrete test tags
  $tags: ({ $testMeta }, use) => use($testMeta.tags || []),

  // init $test with base test, but it will be overwritten in test file
  $test: ({}, use) => use(base),

  $step: ({}, use) => use({ title: '' }),

  // feature file uri, relative to configDir, will be overwritten in test file
  $uri: ({}, use) => use(''),

  // can be owerwritten in test file if there are scenario hooks
  $scenarioHookFixtures: ({}, use) => use({}),
  $before: [
    // Unused dependencies are important:
    // 1. $beforeAll / $afterAll: in pw < 1.39 worker-scoped auto-fixtures were called after test-scoped
    // 2. $after: to call after hooks in case of errors in before hooks
    async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    { auto: true },
  ],
  $after: [
    async ({ $scenarioHookFixtures, $bddContext, $tags }, use, $testInfo) => {
      await use();
      await runScenarioHooks('after', {
        $bddContext,
        $tags,
        $testInfo,
        ...$scenarioHookFixtures,
      });
    },
    { auto: true },
  ],

  // can be owerwritten in test file if there are worker hooks
  $workerHookFixtures: [({}, use) => use({}), { scope: 'worker' }],
  $beforeAll: [
    // Important unused dependencies:
    // 1. $afterAll: in pw < 1.39 worker-scoped auto-fixtures are called in incorrect order
    // 2. $bddContextWorker: to load hooks before this fixtures
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async ({ $workerHookFixtures, $bddContextWorker }, use, $workerInfo) => {
      await runWorkerHooks('beforeAll', { $workerInfo, ...$workerHookFixtures });
      await use();
    },
    { auto: true, scope: 'worker' },
  ],
  $afterAll: [
    async ({ $workerHookFixtures }, use, $workerInfo) => {
      await use();
      await runWorkerHooks('afterAll', { $workerInfo, ...$workerHookFixtures });
    },
    { auto: true, scope: 'worker' },
  ],
});
