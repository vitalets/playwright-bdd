import timers from 'node:timers/promises';
import { test as base, createBdd } from 'playwright-bdd';

const logger = console;

export const test = base.extend<
  { fixtureForFoo: void; fixtureForBar: void },
  { track: (s: string) => unknown }
>({
  fixtureForFoo: async ({ track }, use) => {
    // tiny delay to have always foo after bar
    await timers.setTimeout(50);
    track(`setup fixture for foo`);
    await use();
  },

  fixtureForBar: async ({ track }, use) => {
    track(`setup fixture for bar`);
    await use();
  },

  track: [
    async ({}, use, workerInfo) => {
      const fn = (hookTitle: string) => {
        logger.log(`worker ${workerInfo.workerIndex}: ${hookTitle}`);
      };
      await use(fn);
    },
    { scope: 'worker' },
  ],
});

export const { Given, Before, After, AfterAll } = createBdd(test);
