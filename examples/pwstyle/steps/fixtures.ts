import { Page, expect } from '@playwright/test';
import { createBDD } from 'playwright-bdd';

// test-scoped fixture
class MyPage {
  constructor(public page: Page) {}

  async openLink(name: string) {
    await this.page.getByRole('link', { name }).click();
  }

  async matchTitle(text: string) {
    await expect(this.page).toHaveTitle(new RegExp(text));
  }
}

// worker-scoped fixture
class Account {
  constructor(public username: string, public password: string) {}
}

export const { Given, When, Then } = createBDD<{ myPage: MyPage }, { account: Account }>({
  myPage: async ({ page }, use) => {
    await use(new MyPage(page));
  },
  account: [
    async ({}, use) => {
      await use(new Account('user', '123'));
    },
    { scope: 'worker' },
  ],
});
