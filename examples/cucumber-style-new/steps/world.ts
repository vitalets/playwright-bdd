import { Page, TestInfo } from '@playwright/test';

export class World {
  constructor(
    public page: Page,
    public testInfo: TestInfo,
  ) {}

  async openHomePage() {
    await this.page.goto('https://playwright.dev');
  }

  async clickLink(name: string) {
    await this.page.getByRole('link', { name }).click();
  }
}
