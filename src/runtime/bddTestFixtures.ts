/**
 * Test-scoped fixtures added by playwright-bdd.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { test as base } from './bddWorkerFixtures';
import { getScenarioHooksToRun, runScenarioHooks, ScenarioHookType } from '../hooks/scenario';
import { BddStepInvoker, BddStepFn } from './bddStepInvoker';
import { TestTypeCommon } from '../playwright/types';
import { TestInfo } from '@playwright/test';
import { BddTestData } from '../bddData/types';
import { BddContext, BddStepInfo } from './bddContext';
import { PromptFixture } from '../ai/promptAttachment';

// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.

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
  $step: BddStepInfo;
  $uri: string;
  $applySpecialTags: void;
  $world: unknown;
  $runScenarioHooks: (
    type: ScenarioHookType,
    customFixtures: Record<string, unknown>,
  ) => Promise<void>;
  $prompt: PromptFixture;
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
    async ({ $tags, $test, $bddConfig, $bddTestData, $uri, $step }, use, testInfo) => {
      if (!$bddTestData) throw errorBddTestDataNotFound(testInfo);

      await use({
        config: $bddConfig,
        featureUri: $uri,
        testInfo,
        test: $test,
        tags: $tags,
        step: $step,
        stepIndex: -1,
        bddTestData: $bddTestData,
      });
    },
    fixtureOptions,
  ],

  // Important to pass $world dependency here, not via $bddContext
  // to avoid circular dependency, see #319.
  //
  // Unused fixtures here are important:
  // - $applySpecialTags: to apply special tags before test run
  // - $beforeEach: to not run any steps in background's test.beforeEach
  //   because Playwright runs all before* hooks even in case of error in one of them
  //   See: https://github.com/microsoft/playwright/issues/28285
  Given: [
    async ({ $bddContext, $world, $applySpecialTags }, use) => {
      const invoker = new BddStepInvoker($bddContext, $world);
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

  // This fixture is used inside test.beforeEach() / test.afterEach() to run scenario hooks.
  $runScenarioHooks: [
    async ({ $bddContext, $world }, use) => {
      await use(async (type, customFixtures) => {
        const hooksToRun = getScenarioHooksToRun(type, $bddContext.tags);
        if (type === 'after') hooksToRun.reverse();
        await runScenarioHooks(hooksToRun, $world, { $bddContext, ...customFixtures });
      });
    },
    fixtureOptions,
  ],

  // "Fix with AI" helper fixture
  $prompt: [
    async ({ $bddContext }, use) => {
      const prompt = new PromptFixture($bddContext);
      await use(prompt);
      await prompt.attach();
    },
    // Temporarily un-box $prompt fixture to avoid warning from PW.
    // See: https://github.com/microsoft/playwright/issues/37147
    // TODO: revert to fixtureOptions (e.g. box=true) when fixed in Playwright.
    { scope: 'test' },
  ],
});

function errorBddTestDataNotFound(testInfo: TestInfo) {
  const testLocation = testInfo.file + ':' + testInfo.line;
  return new Error(`bddTestData not found for test: ${testLocation}`);
}
