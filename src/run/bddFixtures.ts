import { TestInfo, test as base } from '@playwright/test';
import { loadConfig as loadCucumberConfig } from '../cucumber/loadConfig';
import { loadSteps } from '../cucumber/loadSteps';
import { BddWorld, BddWorldFixtures, getWorldConstructor } from './bddWorld';
import { extractCucumberConfig } from '../config';
import { getConfigFromEnv } from '../config/env';
import { TestTypeCommon } from '../playwright/types';
import { appendDecoratorSteps } from '../stepDefinitions/decorators/steps';
import { getPlaywrightConfigDir } from '../config/dir';
import { runScenarioHooks } from '../hooks/scenario';
import { runWorkerHooks } from '../hooks/worker';
import { IRunConfiguration } from '@cucumber/cucumber/api';
import { StepInvoker } from './StepInvoker';
import { ISupportCodeLibrary } from '../cucumber/types';
import { TestMeta, TestMetaMap, getTestMeta } from '../gen/testMeta';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

export type BddFixtures = {
  // fixtures injected into BddWorld:
  // empty object for pw-style, builtin fixtures for cucumber-style
  $bddWorldFixtures: BddWorldFixtures;
  $bddWorld: BddWorld;
  Given: StepInvoker['invoke'];
  When: StepInvoker['invoke'];
  Then: StepInvoker['invoke'];
  And: StepInvoker['invoke'];
  But: StepInvoker['invoke'];
  $testMetaMap: TestMetaMap;
  $testMeta: TestMeta;
  $tags: string[];
  $test: TestTypeCommon;
  $uri: string;
  $scenarioHookFixtures: Record<string, unknown>;
  $before: void;
  $after: void;
  $lang: string;
};

type BddFixturesWorker = {
  $cucumber: {
    runConfiguration: IRunConfiguration;
    supportCodeLibrary: ISupportCodeLibrary;
    World: typeof BddWorld;
  };
  $workerHookFixtures: Record<string, unknown>;
  $beforeAll: void;
  $afterAll: void;
};

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

      const supportCodeLibrary = await loadSteps(runConfiguration, environment);
      appendDecoratorSteps(supportCodeLibrary);
      const World = getWorldConstructor(supportCodeLibrary);

      await use({ runConfiguration, supportCodeLibrary, World });
    },
    { auto: true, scope: 'worker' },
  ],
  // $lang fixture can be overwritten in test file
  $lang: ({}, use) => use(''),
  // init $bddWorldFixtures with empty object, will be owerwritten in test file for cucumber-style
  $bddWorldFixtures: ({}, use) => use({} as BddWorldFixtures),
  $bddWorld: async (
    { $tags, $test, $bddWorldFixtures, $cucumber, $lang, $testMeta, $uri },
    use,
    testInfo,
  ) => {
    const { runConfiguration, supportCodeLibrary, World } = $cucumber;
    const world = new World({
      testInfo,
      supportCodeLibrary,
      $tags,
      $test,
      $bddWorldFixtures,
      lang: $lang,
      parameters: runConfiguration.runtime.worldParameters || {},
      log: () => {},
      attach: async () => {},
    });
    await world.init();
    await use(world);
    await world.destroy();
    // todo: hide under config option
    await world.$internal.bddData.attach($testMeta, $uri);
  },

  Given: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'Given').invoke),
  When: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'When').invoke),
  Then: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'Then').invoke),
  And: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'And').invoke),
  But: ({ $bddWorld }, use) => use(new StepInvoker($bddWorld, 'But').invoke),

  // init $testMetaMap with empty object, will be overwritten in each test file
  $testMetaMap: ({}, use) => use({}),

  // concrete test meta
  $testMeta: ({ $testMetaMap }, use, testInfo) => use(getTestMeta($testMetaMap, testInfo)),

  // concrete test tags
  $tags: ({ $testMeta }, use) => use($testMeta.tags || []),

  // init $test with base test, but it will be overwritten in test file
  $test: ({}, use) => use(base),

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

/** these fixtures automatically injected into every step call */
export type BddAutoInjectFixtures = Pick<BddFixtures, '$test' | '$tags'> & {
  $testInfo: TestInfo;
};

const BDD_AUTO_INJECT_FIXTURES: (keyof BddAutoInjectFixtures)[] = ['$testInfo', '$test', '$tags'];

export function isBddAutoInjectFixture(name: string) {
  return BDD_AUTO_INJECT_FIXTURES.includes(name as keyof BddAutoInjectFixtures);
}
