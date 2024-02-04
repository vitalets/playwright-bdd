import { Page } from '@playwright/test';
import { test as base } from 'playwright-bdd';

class MyPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('https://example.com');
  }
}

export const test = base.extend<{ myPage: MyPage }>({
  myPage: ({ page }, use) => use(new MyPage(page)),
});
