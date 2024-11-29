import { test as base } from 'playwright-bdd';

export const test = base.extend<{ world1: string; world2: string }>({
  world1: async ({}, use) => use('world1'),
});
