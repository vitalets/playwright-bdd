import { test as base } from '@playwright/test';
import { loadCucumber, getWorldConstructor } from './support';
import { invokeStep } from './invoke';

export const test = base.extend({
  world: async (
    { page, context, browser, browserName, request },
    use,
    testInfo
  ) => {
    const { runConfiguration, supportCodeLibrary } = await loadCucumber();
    const World = getWorldConstructor(supportCodeLibrary);
    const world = new World({
      page,
      context,
      browser,
      browserName,
      request,
      testInfo,
      parameters: runConfiguration.runtime.worldParameters || {},
      log: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
      attach: async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    });
    await world.init();
    await use(world);
    await world.destroy();
  },

  Given: async ({ world }, use) => {
    await use(invokeStep.bind(null, world));
  },

  When: async ({ world }, use) => {
    await use(invokeStep.bind(null, world));
  },

  Then: async ({ world }, use) => {
    await use(invokeStep.bind(null, world));
  },
});
