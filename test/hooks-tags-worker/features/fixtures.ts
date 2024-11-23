import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<object, { myWorkerFixture: string }>({
  myWorkerFixture: [
    async ({}, use) => {
      await use('myWorkerFixture');
    },
    { scope: 'worker' },
  ],
});

export const { Given, BeforeAll, AfterAll } = createBdd(test);
