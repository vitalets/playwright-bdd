import { test as base, createBdd } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: async ({ page }, use, testInfo) => {
    const world = new World(page, testInfo);
    await use(world);
  },
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
