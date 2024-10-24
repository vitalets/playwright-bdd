import { test as base, createBdd } from 'playwright-bdd';

const logger = console;

export const test = base.extend<{ fixtureForFoo: void; fixtureForBar: void }>({
  fixtureForFoo: async ({}, use) => {
    logger.log(`setup fixture for foo`);
    await use();
  },

  fixtureForBar: async ({}, use) => {
    logger.log(`setup fixture for bar`);
    await use();
  },
});

export const { Given, Before, After, AfterAll } = createBdd(test);
