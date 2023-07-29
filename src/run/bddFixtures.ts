import { TestInfo, test as base } from '@playwright/test';
import { loadConfig as loadCucumberConfig } from '../cucumber/loadConfig';
import { loadSteps } from '../cucumber/loadSteps';
import { World, getWorldConstructor } from './world';
import { extractCucumberConfig } from '../config';
import { getConfigFromEnv } from '../config/env';
import { TestTypeCommon } from '../playwright/types';
import { appendDecoratorSteps } from '../stepDefinitions/createDecorators';
import { getPlaywrightConfigDir } from '../config/dir';

export type BddFixtures = {
  cucumberWorld: World;
  Given: World['invokeStep'];
  When: World['invokeStep'];
  Then: World['invokeStep'];
  And: World['invokeStep'];
  But: World['invokeStep'];
  $tags: string[];
  $test: TestTypeCommon;
};

export const test = base.extend<BddFixtures>({
  cucumberWorld: async (
    { page, context, browser, browserName, request, $tags, $test },
    use,
    testInfo,
  ) => {
    const config = getConfigFromEnv(testInfo.project.testDir);
    const { runConfiguration } = await loadCucumberConfig({
      provided: extractCucumberConfig(config),
    });
    const environment = { cwd: getPlaywrightConfigDir() };
    const supportCodeLibrary = await loadSteps(runConfiguration, environment);

    appendDecoratorSteps(supportCodeLibrary);

    const World = getWorldConstructor(supportCodeLibrary);
    const world = new World({
      page,
      context,
      browser,
      browserName,
      request,
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
  Given: ({ cucumberWorld }, use) => use(cucumberWorld.invokeStep),
  When: ({ cucumberWorld }, use) => use(cucumberWorld.invokeStep),
  Then: ({ cucumberWorld }, use) => use(cucumberWorld.invokeStep),
  And: ({ cucumberWorld }, use) => use(cucumberWorld.invokeStep),
  But: ({ cucumberWorld }, use) => use(cucumberWorld.invokeStep),
  // Init $tags fixture with empty array. Can be owerwritten in test file
  $tags: ({}, use) => use([]),
  // Init $test fixture with base test, but it will be always overwritten in test file
  $test: ({}, use) => use(base),
});

/** these fixtures automatically injected into every step call */
export type BddAutoInjectFixtures = Pick<BddFixtures, '$test' | '$tags'> & {
  $testInfo: TestInfo; // todo: deprecate $testInfo in favor of $test.info()
};

const BDD_AUTO_INJECT_FIXTURES: (keyof BddAutoInjectFixtures)[] = ['$testInfo', '$test', '$tags'];

export function isBddAutoInjectFixture(name: string) {
  return BDD_AUTO_INJECT_FIXTURES.includes(name as keyof BddAutoInjectFixtures);
}
