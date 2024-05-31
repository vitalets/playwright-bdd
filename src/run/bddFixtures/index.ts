import { test as base } from '@playwright/test';
import { loadConfig as loadCucumberConfig } from '../../cucumber/loadConfig';
import { loadSteps } from '../../cucumber/loadSteps';
import { BddWorldFixtures, getWorldConstructor } from '../bddWorld';
import { extractCucumberConfig } from '../../config';
import { getConfigFromEnv } from '../../config/env';
import { appendDecoratorSteps } from '../../steps/decorators/steps';
import { getPlaywrightConfigDir } from '../../config/configDir';
import { runScenarioHooks } from '../../hooks/scenario';
import { runWorkerHooks } from '../../hooks/worker';
import { StepInvoker } from '../StepInvoker';
import { getTestMeta } from '../../gen/testMeta';
import { logger } from '../../utils/logger';
import { getEnrichReporterData } from '../../config/enrichReporterData';
import { BddDataManager } from '../bddData';
import { BddFixtures, BddFixturesWorker } from './types';
import { loadStepsOwn } from '../../cucumber/loadStepsOwn';
import { SpecialTags } from '../../specialTags';
import { appendNewCucumberStyleSteps } from '../../steps/cucumberStyle';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

export const test = base.extend<BddFixtures, BddFixturesWorker>({
  // load cucumber once per worker (auto-fixture)
  // todo: maybe remove caching in cucumber/loadConfig.ts and cucumber/loadSteps.ts
  // as we call it once per worker. Check generation phase.
  $cucumber: [
    async ({}, use, workerInfo) => {
      const config = getConfigFromEnv(workerInfo.project.testDir);
      const environment = { cwd: getPlaywrightConfigDir() };
      const { runConfiguration } = await loadCucumberConfig(
        {
          provided: extractCucumberConfig(config),
        },
        environment,
      );

      const supportCodeLibrary = config.steps
        ? await loadStepsOwn(environment.cwd, config.steps)
        : await loadSteps(runConfiguration, environment);
      appendDecoratorSteps(supportCodeLibrary);
      appendNewCucumberStyleSteps(supportCodeLibrary);

      const World = getWorldConstructor(supportCodeLibrary);

      await use({ runConfiguration, supportCodeLibrary, World, config });
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
  // init $bddWorldFixtures with empty object, will be owerwritten in test file for cucumber-style
  $bddWorldFixtures: ({}, use) => use({} as BddWorldFixtures),
  $bddWorld: async (
    {
      $tags,
      $test,
      $step,
      $bddWorldFixtures,
      $cucumber,
      $lang,
      $testMeta,
      $uri,
      $newCucumberStyleWorld,
    },
    use,
    testInfo,
  ) => {
    const { runConfiguration, supportCodeLibrary, World, config } = $cucumber;
    const world = new World({
      testInfo,
      supportCodeLibrary,
      $tags,
      $test,
      $step,
      $bddWorldFixtures,
      lang: $lang,
      parameters: runConfiguration.runtime.worldParameters || {},
      log: () => logger.warn(`world.log() is noop, please use world.testInfo.attach()`),
      attach: async () => logger.warn(`world.attach() is noop, please use world.testInfo.attach()`),
    });
    if (getEnrichReporterData(config)) {
      world.$internal.bddDataManager = new BddDataManager(testInfo, $testMeta, $uri);
    }
    world.$internal.newCucumberStyleWorld = $newCucumberStyleWorld;
    await world.init();
    await use(world);
    await world.destroy();
  },

  Given: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'Given').invoke),
  When: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'When').invoke),
  Then: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'Then').invoke),
  And: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'And').invoke),
  But: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'But').invoke),

  // new Cucumber style world, can be overwritten in test files
  $newCucumberStyleWorld: ({}, use: (arg: unknown) => unknown) => use(null),

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
      { $scenarioHookFixtures, $bddWorld, $tags, $beforeAll, $afterAll, $after },
      use,
      $testInfo,
    ) => {
      await runScenarioHooks('before', { $bddWorld, $tags, $testInfo, ...$scenarioHookFixtures });
      await use();
    },
    { auto: true },
  ],
  $after: [
    async ({ $scenarioHookFixtures, $bddWorld, $tags }, use, $testInfo) => {
      await use();
      await runScenarioHooks('after', { $bddWorld, $tags, $testInfo, ...$scenarioHookFixtures });
    },
    { auto: true },
  ],

  // can be owerwritten in test file if there are worker hooks
  $workerHookFixtures: [({}, use) => use({}), { scope: 'worker' }],
  $beforeAll: [
    // Important unused dependencies:
    // 1. $afterAll: in pw < 1.39 worker-scoped auto-fixtures are called in incorrect order
    // 2. $cucumber: to load hooks before this fixtures
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async ({ $workerHookFixtures, $cucumber }, use, $workerInfo) => {
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
