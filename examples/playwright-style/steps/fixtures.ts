import { Page, expect } from '@playwright/test';
import { test as base } from 'playwright-bdd';

class PWPage {
  constructor(public page: Page) {}

  async openLink(name: string) {
    await this.page.getByRole('link', { name }).click();
  }

  async matchTitle(text: string) {
    await expect(this.page).toHaveTitle(new RegExp(text));
  }
}

export const test = base.extend<{ pwPage: PWPage }>({
  pwPage: async ({ page }, use) => {
    await use(new PWPage(page));
  },
});
