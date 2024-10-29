import { test as base, createBdd } from 'playwright-bdd';

export class CustomWorld {
  foo = 'bar';
}

export const test = base.extend<
  { world: CustomWorld; someTestFixture: string },
  { someWorkerFixture: string }
>({
  world: ({}, use) => use(new CustomWorld()),
  someTestFixture: ({}, use) => use('someTestFixture'),
  someWorkerFixture: [({}, use) => use('someWorkerFixture'), { scope: 'worker' }],
});

export const { Given, Before, After, BeforeAll, AfterAll } = createBdd(test, {
  worldFixture: 'world',
});
