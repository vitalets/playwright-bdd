import { test as base, createBdd } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: async ({}, use) => use(new World()),
});

export const { Given, Before } = createBdd(test, { worldFixture: 'world' });
