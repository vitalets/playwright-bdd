import { test as base, createBdd } from 'playwright-bdd';

export const logger = console;

export const test = base.extend<{
  fixtureBg1: void;
  fixtureBg2: void;
}>({
  fixtureBg1: async ({ $testInfo }, use) => {
    logger.log(`${$testInfo.title}: fixtureBg1`);
    await use();
  },

  fixtureBg2: async ({ $testInfo }, use) => {
    logger.log(`${$testInfo.title}: fixtureBg2`);
    await use();
  },
});

export const { Given } = createBdd(test);
