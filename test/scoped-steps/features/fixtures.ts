import { test as base, createBdd } from 'playwright-bdd';
import { TodoPage, TodoPage2 } from './poms';

export const logger = console;

export const test = base.extend<{
  fixtureBg1: void;
  fixtureBg2: void;
  todoPage: TodoPage;
  todoPage2: TodoPage2;
}>({
  fixtureBg1: async ({ $testInfo }, use) => {
    logger.log(`${$testInfo.title}: fixtureBg1`);
    await use();
  },

  fixtureBg2: async ({ $testInfo }, use) => {
    logger.log(`${$testInfo.title}: fixtureBg2`);
    await use();
  },

  todoPage: async ({}, use, testInfo) => use(new TodoPage(testInfo)),
  todoPage2: async ({}, use, testInfo) => use(new TodoPage2(testInfo)),
});

export const { Given } = createBdd(test);
