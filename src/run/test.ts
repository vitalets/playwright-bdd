import { test as base } from '@playwright/test';
import { loadCucumber, getWorldConstructor, invokeStep } from './support';

export const test = base.extend({
  world: async (
    { page, context, browser, browserName, request },
    use,
    testInfo
  ) => {
    const { runConfiguration, supportCodeLibrary } = await loadCucumber();
    const World = getWorldConstructor(supportCodeLibrary);
    const world = new World(
      {
        page,
        context,
        browser,
        browserName,
        request,
        parameters: runConfiguration.runtime.worldParameters || {},
        log: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
        attach: async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
      },
      testInfo
    );
    await use(world);
  },

  Given: async ({ world }, use) => {
    await use((stepText: string) => invokeStep(world, stepText));
  },

  When: async ({ world }, use) => {
    await use((stepText: string) => invokeStep(world, stepText));
  },

  Then: async ({ world }, use) => {
    await use((stepText: string) => invokeStep(world, stepText));
  },
});
