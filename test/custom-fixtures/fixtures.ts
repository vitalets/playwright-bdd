import { Page } from '@playwright/test';
import { createBDD } from './internal';

class TodoPage {
  constructor(public page: Page) {}
}

type Account = {
  username: string;
  password: string;
};

const { Then } = createBDD<{ todoPage: TodoPage }, { account: Account }>({
  todoPage: async ({ page }, use) => {
    await use(new TodoPage(page));
  },
  account: [
    async ({}, use) => {
      await use({ username: 'user', password: '123' });
    },
    { scope: 'worker' },
  ],
});

export { Then };
