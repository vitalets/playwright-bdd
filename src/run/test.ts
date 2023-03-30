import { test as base } from '@playwright/test';
import { getSupportCodeLibrary, invokeStep } from './support';

export const test = base.extend({
  world: async ({ page, context, browser, browserName, request }, use) => {
    const support = await getSupportCodeLibrary();
    const world = new support.World();
    // Todo: support world parameters
    // See: https://github.com/cucumber/cucumber-js/blob/764b7b6be4ccaa235954acb6424fb9725df6a643/src/runtime/test_case_runner.ts#L96

    // Set props directly to keep constructor signature for user
    // See: https://playwright.dev/docs/test-fixtures#built-in-fixtures
    world.page = page;
    world.context = context;
    world.browser = browser;
    world.browserName = browserName;
    world.request = request;

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
