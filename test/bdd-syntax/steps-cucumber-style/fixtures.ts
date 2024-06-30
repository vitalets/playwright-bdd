import { test as base, createBdd } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: ({ $tags }, use, testInfo) => use({ testInfo, tags: $tags }),
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
