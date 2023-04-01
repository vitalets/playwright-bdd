import { test as base } from '@playwright/test';
import {
  getSupportCodeLibrary,
  getWorldConstructor,
  invokeStep,
} from './support';

export const test = base.extend({
  world: async (
    { page, context, browser, browserName, request },
    use,
    testInfo
  ) => {
    const support = await getSupportCodeLibrary();
    const World = getWorldConstructor(support);
    const world = new World(
      {
        page,
        context,
        browser,
        browserName,
        request,
        // cucumber props
        // See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/test_case_runner.ts#L96
        parameters: {},
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
