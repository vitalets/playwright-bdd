import { test as base } from 'playwright-bdd';

export const test = base.extend<
  object,
  {
    workerFixtureWithErrorInSetup: void;
    workerFixtureWithTimeoutInSetup: void;
  }
>({
  workerFixtureWithErrorInSetup: [
    async ({}, use) => {
      throw new Error('error in worker fixture setup');
      await use();
    },
    { scope: 'worker' },
  ],
  workerFixtureWithTimeoutInSetup: [
    async ({}, use, workerInfo) => {
      await new Promise((r) => setTimeout(r, workerInfo.project.timeout + 100));
      await use();
    },
    { scope: 'worker' },
  ],
});
