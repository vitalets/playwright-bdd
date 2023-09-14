import { TestInfo, test as base } from '@playwright/test';
import { loadConfig as loadCucumberConfig } from '../cucumber/loadConfig';
import { loadSteps } from '../cucumber/loadSteps';
import { BddWorld, getWorldConstructor } from './bddWorld';
import { extractCucumberConfig } from '../config';
import { getConfigFromEnv } from '../config/env';
import { TestTypeCommon } from '../playwright/types';
import { appendDecoratorSteps } from '../stepDefinitions/decorators/steps';
import { getPlaywrightConfigDir } from '../config/dir';

export type BddFixtures = {
  // bddWorldBase is used internally for playwright-style and does not contain Playwright builtin fixtures
  $bddWorldBase: BddWorld;
  // bddWorld is used for cucumber-style and contains Playwright builtin fixtures
  $bddWorld: BddWorld;
  Given: BddWorld['invokeStep'];
  When: BddWorld['invokeStep'];
  Then: BddWorld['invokeStep'];
  And: BddWorld['invokeStep'];
  But: BddWorld['invokeStep'];
  Given_: BddWorld['invokeStep'];
  When_: BddWorld['invokeStep'];
  Then_: BddWorld['invokeStep'];
  And_: BddWorld['invokeStep'];
  But_: BddWorld['invokeStep'];
  $tags: string[];
  $test: TestTypeCommon;
};

export const test = base.extend<BddFixtures>({
  $bddWorldBase: async ({ $tags, $test }, use, testInfo) => {
    const config = getConfigFromEnv(testInfo.project.testDir);
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
    const world = new World({
      testInfo,
      supportCodeLibrary,
      $tags,
      $test,
      parameters: runConfiguration.runtime.worldParameters || {},
      log: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
      attach: async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    });
    await world.init();
    await use(world);
    await world.destroy();
  },
  $bddWorld: async ({ $bddWorldBase, page, context, browser, browserName, request }, use) => {
    $bddWorldBase.builtinFixtures = {
      page,
      context,
      browser,
      browserName,
      request,
    };
    await use($bddWorldBase);
  },

  // below fixtures are used in playwright-style
  // and does not automatically init Playwright builtin fixtures
  Given: ({ $bddWorldBase }, use) => use($bddWorldBase.invokeStep),
  When: ({ $bddWorldBase }, use) => use($bddWorldBase.invokeStep),
  Then: ({ $bddWorldBase }, use) => use($bddWorldBase.invokeStep),
  And: ({ $bddWorldBase }, use) => use($bddWorldBase.invokeStep),
  But: ({ $bddWorldBase }, use) => use($bddWorldBase.invokeStep),

  // below fixtures are used in cucumber-style
  // and automatically init Playwright builtin fixtures
  Given_: ({ $bddWorld }, use) => use($bddWorld.invokeStep),
  When_: ({ $bddWorld }, use) => use($bddWorld.invokeStep),
  Then_: ({ $bddWorld }, use) => use($bddWorld.invokeStep),
  And_: ({ $bddWorld }, use) => use($bddWorld.invokeStep),
  But_: ({ $bddWorld }, use) => use($bddWorld.invokeStep),

  // Init $tags fixture with empty array. Can be owerwritten in test file
  $tags: ({}, use) => use([]),
  // Init $test fixture with base test, but it will be always overwritten in test file
  $test: ({}, use) => use(base),
});

/** these fixtures automatically injected into every step call */
export type BddAutoInjectFixtures = Pick<BddFixtures, '$test' | '$tags'> & {
  $testInfo: TestInfo;
};

const BDD_AUTO_INJECT_FIXTURES: (keyof BddAutoInjectFixtures)[] = ['$testInfo', '$test', '$tags'];

export function isBddAutoInjectFixture(name: string) {
  return BDD_AUTO_INJECT_FIXTURES.includes(name as keyof BddAutoInjectFixtures);
}
