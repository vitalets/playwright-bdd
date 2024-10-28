import timers from 'node:timers/promises';
import { test as base, createBdd } from 'playwright-bdd';

const logger = console;

export const test = base.extend<object, { track: (s: string) => unknown }>({
  track: [
    async ({}, use, workerInfo) => {
      const fn = async (hookTitle: string) => {
        logger.log(`worker ${workerInfo.workerIndex}: ${hookTitle}`);
        const shouldTimeout = process.env.TIMEOUT && hookTitle.startsWith(process.env.TIMEOUT);
        if (shouldTimeout) {
          await timers.setTimeout(100);
        }
      };
      await use(fn);
    },
    { scope: 'worker' },
  ],
});

export const { Given, Before, BeforeAll, After, AfterAll } = createBdd(test);
