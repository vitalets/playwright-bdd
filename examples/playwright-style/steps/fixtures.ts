import { Page, expect } from '@playwright/test';
import { test as base } from 'playwright-bdd';

class HomePage {
  constructor(public page: Page) {}

  async open() {
    await this.page.goto('https://playwright.dev');
  }

  async clickLink(name: string) {
    await this.page.getByRole('link', { name }).click();
  }
}

export const test = base.extend<{ homePage: HomePage }>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});
