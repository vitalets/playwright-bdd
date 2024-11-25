import timers from 'node:timers/promises';
import { test as base, createBdd } from 'playwright-bdd';
import { withLog } from '../../_helpers/withLog';

type TestFixtures = {
  testFixtureCommon: void;
  testFixtureScenario1: void;
};

export const test = withLog(base).extend<TestFixtures>({
  testFixtureCommon: async ({ log }, use) => {
    log(`testFixtureCommon setup`);
    await use();
  },

  testFixtureScenario1: async ({ log }, use) => {
    // tiny delay to have always foo after bar
    await timers.setTimeout(50);
    log(`testFixtureScenario1 setup`);
    await use();
  },
});

export const { Given, Before, BeforeAll, After, AfterAll } = createBdd(test);
