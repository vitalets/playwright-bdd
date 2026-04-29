import { createBdd, test as base } from 'playwright-bdd';

type World = Record<string, unknown>;

export const test = base.extend<{ world: World }>({
  world: async ({}, use) => use({}),
});

export const { Given } = createBdd(test, { worldFixture: 'world' });
