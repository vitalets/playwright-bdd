/**
 * Fixture to track calls in a worker.
 */
// don't import from 'playwright-bdd' as it will use another instance
import { test as base } from '../node_modules/playwright-bdd';

const logger = console;

export const test = base.extend<object, { track: (title: string) => unknown }>({
  track: [
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
