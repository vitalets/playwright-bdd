import { TestInfo, test as base } from '@playwright/test';
import { loadConfig as loadCucumberConfig } from '../cucumber/loadConfig';
import { loadSteps } from '../cucumber/loadSteps';
import { BddWorld, BddWorldFixtures, getWorldConstructor } from './bddWorld';
import { extractCucumberConfig } from '../config';
import { getConfigFromEnv } from '../config/env';
import { TestTypeCommon } from '../playwright/types';
import { appendDecoratorSteps } from '../stepDefinitions/decorators/steps';
import { getPlaywrightConfigDir } from '../config/dir';

export type BddFixtures = {
  // fixtures injected into BddWorld:
  // empty object for pw-style, builtin fixtures for cucumber-style
  $bddWorldFixtures: Record<string, never> | BddWorldFixtures;
  $bddWorld: BddWorld;
  Given: BddWorld['invokeStep'];
  When: BddWorld['invokeStep'];
  Then: BddWorld['invokeStep'];
  And: BddWorld['invokeStep'];
  But: BddWorld['invokeStep'];
  $tags: string[];
  $test: TestTypeCommon;
};

export const test = base.extend<BddFixtures>({
  // init $bddWorldFixtures with empty object, will be owerwritten in test file for cucumber-style
  $bddWorldFixtures: ({}, use) => use({}),
  $bddWorld: async ({ $tags, $test, $bddWorldFixtures }, use, testInfo) => {
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
      // cast to BddWorldFixtures even for empty object for propper typing
      // it will not be used for pw-style
      $bddWorldFixtures: $bddWorldFixtures as BddWorldFixtures,
      parameters: runConfiguration.runtime.worldParameters || {},
      log: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
      attach: async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    });
    await world.init();
    await use(world);
    await world.destroy();
  },

  Given: ({ $bddWorld }, use) => use($bddWorld.invokeStep),
  When: ({ $bddWorld }, use) => use($bddWorld.invokeStep),
  Then: ({ $bddWorld }, use) => use($bddWorld.invokeStep),
  And: ({ $bddWorld }, use) => use($bddWorld.invokeStep),
  But: ({ $bddWorld }, use) => use($bddWorld.invokeStep),

  // init $tags with empty array, can be owerwritten in test file
  $tags: ({}, use) => use([]),
  // init $test with base test, but it will be always overwritten in test file
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
