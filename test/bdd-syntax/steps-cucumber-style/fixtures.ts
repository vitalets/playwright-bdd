import { test as base, createBdd } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: ({ $tags, $step }, use, testInfo) => use({ testInfo, tags: $tags, step: $step }),
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
