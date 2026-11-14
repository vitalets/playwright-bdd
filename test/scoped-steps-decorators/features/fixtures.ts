import { test as base } from 'playwright-bdd';
import { TodoPage, TodoPage2, TodoPage3, TodoPage4 } from './poms';
import { CartPage, CheckoutPage } from './configured-decorators';

export const logger = console;

export const test = base.extend<{
  todoPage: TodoPage;
  todoPage2: TodoPage2;
  todoPage3: TodoPage3;
  todoPage4: TodoPage4;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
}>({
  todoPage: async ({}, use, testInfo) => use(new TodoPage(testInfo)),
  todoPage2: async ({}, use, testInfo) => use(new TodoPage2(testInfo)),
  todoPage3: async ({}, use, testInfo) => use(new TodoPage3(testInfo)),
  todoPage4: async ({}, use, testInfo) => use(new TodoPage4(testInfo)),
  cartPage: ({ $step }, use) => use(new CartPage($step)),
  checkoutPage: ({}, use) => use(new CheckoutPage()),
});
