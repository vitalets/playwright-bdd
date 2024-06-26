import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ someTestFixture: string }, { someWorkerFixture: string }>({
  someTestFixture: ({}, use) => use('someTestFixture'),
  someWorkerFixture: [({}, use) => use('someWorkerFixture'), { scope: 'worker' }],
});

export const { Given, Before, After, BeforeAll, AfterAll } = createBdd(test);
