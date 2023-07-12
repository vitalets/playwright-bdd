import { setWorldConstructor } from '@cucumber/cucumber';
import { World } from 'playwright-bdd';

export class CustomWorld extends World {
  async openHomePage() {
    await this.page.goto('https://playwright.dev');
  }

  async clickLink(name: string) {
    await this.page.getByRole('link', { name }).click();
  }
}

setWorldConstructor(CustomWorld);
