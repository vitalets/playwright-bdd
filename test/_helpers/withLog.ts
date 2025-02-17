/**
 * Fixture to track calls in a worker.
 * Important to use this fixture to log events for later checking,
 * instead of using console.log directly in the test.
 * Because Playwright's default reporter may overwrite the console.log output on CI.
 */

import { test as base } from 'playwright-bdd';

const logger = console;

export const testWithLog = base.extend<object, { log: (message: string) => unknown }>({
  log: [
    async ({}, use, workerInfo) => {
      const calls: string[] = [''];
      const fn = (title: string) => {
        calls.push(`worker ${workerInfo.workerIndex}: ${title}`);
      };
      await use(fn);
      logger.log(calls.join('\n'));
    },
    { scope: 'worker', auto: true },
  ],
});
