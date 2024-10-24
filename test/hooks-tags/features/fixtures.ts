import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ myFixture: string }>({
  myFixture: async ({}, use) => {
    await use('my fixture');
  },
});

export const { Given, Before, After, AfterAll } = createBdd(test);
