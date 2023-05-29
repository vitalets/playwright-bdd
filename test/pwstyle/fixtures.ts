import { Page } from '@playwright/test';
import { test as base } from '../../src/run/baseTest';

class TodoPage {
  prop = '123';
  constructor(public page: Page) {}
}

class Account {
  constructor(public username: string, public password: string) {}
}

export const test = base.extend<{ option: string; todoPage: TodoPage }, { account: Account }>({
  option: ['foo', { option: true }],
  todoPage: async ({ page }, use) => {
    await use(new TodoPage(page));
  },
  account: [
    async ({}, use) => {
      await use(new Account('user', '123'));
    },
    { scope: 'worker' },
  ],
});
