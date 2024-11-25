import { test as base, createBdd } from 'playwright-bdd';
import { withLog } from '../../_helpers/withLog';

type WorkerFixtures = {
  workerFixtureCommon: void;
  workerFixture1: void;
  workerFixture2: void;
};

export const test = withLog(base).extend<object, WorkerFixtures>({
  workerFixtureCommon: [
    async ({ log }, use) => {
      log(`workerFixtureCommon setup`);
      await use();
    },
    { scope: 'worker' },
  ],
  workerFixture1: [
    async ({ log }, use) => {
      log(`workerFixture1 setup`);
      await use();
    },
    { scope: 'worker' },
  ],
  workerFixture2: [
    async ({ log }, use) => {
      log(`workerFixture2 setup`);
      await use();
    },
    { scope: 'worker' },
  ],
});

export const { Given, BeforeAll, AfterAll } = createBdd(test);
