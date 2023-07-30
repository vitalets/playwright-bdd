import { setWorldConstructor } from '@cucumber/cucumber';
import { BddWorld } from 'playwright-bdd';

export class CustomWorld extends BddWorld {
  async openHomePage() {
    await this.page.goto('https://playwright.dev');
  }

  async clickLink(name: string) {
    await this.page.getByRole('link', { name }).click();
  }
}

setWorldConstructor(CustomWorld);
