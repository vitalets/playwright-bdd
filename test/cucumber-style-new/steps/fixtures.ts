import { test as base } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ someFixture: string; world: World }>({
  someFixture: async ({}, use) => use('foo'),
  world: async ({ someFixture }, use) => use(new World(someFixture)),
});
