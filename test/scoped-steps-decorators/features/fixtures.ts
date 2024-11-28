import { test as base } from 'playwright-bdd';
import { TodoPage, TodoPage2, TodoPage3, TodoPage4 } from './poms';

export const logger = console;

export const test = base.extend<{
  todoPage: TodoPage;
  todoPage2: TodoPage2;
  todoPage3: TodoPage3;
  todoPage4: TodoPage4;
}>({
  todoPage: async ({}, use, testInfo) => use(new TodoPage(testInfo)),
  todoPage2: async ({}, use, testInfo) => use(new TodoPage2(testInfo)),
  todoPage3: async ({}, use, testInfo) => use(new TodoPage3(testInfo)),
  todoPage4: async ({}, use, testInfo) => use(new TodoPage4(testInfo)),
});
