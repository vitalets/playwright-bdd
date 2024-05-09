import { test as base, createBdd } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: ({ page }, use, testInfo) => use(new World(page, testInfo)),
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
