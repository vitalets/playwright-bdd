/**
 * Fixture to track calls in a worker.
 * Important to use this fixture to log events for later checking,
 * instead of using console.log directly in the test.
 * Because Playwright's default reporter may overwrite the console.log output on CI.
 */
import { mergeTests, test as base } from '@playwright/test';

const logger = console;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withLog(test: any) {
  return mergeTests(
    test,
    base.extend<object, { log: (message: string) => unknown }>({
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
    }),
  );
}
