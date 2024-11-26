import { test as base, createBdd } from 'playwright-bdd';
import { withLog } from '../../_helpers/withLog';

type TestFixtures = {
  testFixtureCommon: void;
  testFixture1: void;
};

type WorkerFixtures = {
  workerFixtureCommon: void;
  workerFixture1: void;
};

export const test = withLog(base).extend<TestFixtures, WorkerFixtures>({
  testFixtureCommon: async ({ log }, use) => {
    log(`testFixtureCommon setup`);
    await use();
  },

  testFixture1: async ({ log }, use) => {
    log(`testFixture1 setup`);
    await use();
  },
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
});

export const { Given, Before, After, BeforeAll, AfterAll } = createBdd(test);
