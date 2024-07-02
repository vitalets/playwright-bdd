import { test as base, createBdd } from 'playwright-bdd';
import { BddWorld } from './bddWorld';

export const test = base.extend<{ world: BddWorld }>({
  world: async ({ page, context, browser, browserName, request, $tags, $step }, use, testInfo) => {
    const world = new BddWorld({
      test,
      page,
      context,
      browser,
      browserName,
      request,
      testInfo,
      step: $step,
      tags: $tags,
    });
    await use(world);
  },
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
