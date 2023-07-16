import { test as base } from '@playwright/test';
import { loadConfig as loadCucumberConfig } from '../cucumber/loadConfig';
import { loadSteps } from '../cucumber/loadSteps';
import { World, getWorldConstructor } from './world';
import { extractCucumberConfig } from '../config';
import { getConfigFromEnv } from '../config/env';
import { TestTypeCommon } from '../playwright/types';

type BDDFixtures = {
  cucumberWorld: World;
  Given: World['invokeStep'];
  When: World['invokeStep'];
  Then: World['invokeStep'];
  And: World['invokeStep'];
  But: World['invokeStep'];
  $tags: string[];
  $test: TestTypeCommon;
};

export const test = base.extend<BDDFixtures>({
  cucumberWorld: async (
    { page, context, browser, browserName, request, $tags, $test },
    use,
    testInfo,
  ) => {
    const config = getConfigFromEnv(testInfo.project.testDir);
    const { runConfiguration } = await loadCucumberConfig({
      provided: extractCucumberConfig(config),
    });
    const supportCodeLibrary = await loadSteps(runConfiguration);
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
  $tags: ({}, use) => use([]),
  /**
   * This fixture holds reference to current test.
   * Initially we set 'base', but it will be always overwritten in spec files.
   */
  $test: ({}, use) => use(base),
});
