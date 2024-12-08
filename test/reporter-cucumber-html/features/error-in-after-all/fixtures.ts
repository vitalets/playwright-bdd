import { test as base } from 'playwright-bdd';

export const test = base.extend<
  object,
  {
    workerFixtureWithErrorInTeardown: void;
    workerFixtureWithTimeoutInTeardown: void;
  }
>({
  workerFixtureWithErrorInTeardown: [
    async ({}, use) => {
      await use();
      throw new Error('error in worker fixture setup');
    },
    { scope: 'worker' },
  ],
  workerFixtureWithTimeoutInTeardown: [
    async ({}, use, workerInfo) => {
      await use();
      await new Promise((r) => setTimeout(r, workerInfo.project.timeout + 100));
    },
    { scope: 'worker' },
  ],
});
