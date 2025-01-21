import { test as base, createBdd } from 'playwright-bdd';
import { test as baseEyes } from '@applitools/eyes-playwright/fixture';
import { World } from './world';
import { mergeTests } from '@playwright/test';
import { Eyes } from '@applitools/eyes-playwright';

export const test = mergeTests(base, baseEyes).extend<{ world: World }>({
  world: async ({ page, eyes }, use, testInfo) => {
    const world = new World(page, eyes as Eyes, testInfo);
    await use(world);
  },
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
