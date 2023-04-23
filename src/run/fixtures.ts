import { test as base } from '@playwright/test';
import { loadCucumber, getWorldConstructor } from './support';
import { invokeStep } from './invoke';

export const test = base.extend({
  world: async ({ page, context, browser, browserName, request }, use, testInfo) => {
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
  invokeStep: ({ world }, use) => use(invokeStep.bind(null, world)),
  Given: ({ invokeStep }, use) => use(invokeStep),
  When: ({ invokeStep }, use) => use(invokeStep),
  Then: ({ invokeStep }, use) => use(invokeStep),
  And: ({ invokeStep }, use) => use(invokeStep),
  But: ({ invokeStep }, use) => use(invokeStep),
});
