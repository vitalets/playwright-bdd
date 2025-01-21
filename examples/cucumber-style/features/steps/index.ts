import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import type { MatchLevelPlain } from '@applitools/eyes-playwright';

Given('I am on home page', async function () {
  await this.openHomePage();
});

When('I click link {string}', async function (name: string) {
  await this.clickLink(name);
});

Then('I see in title {string}', async function (text: string) {
  await expect(this.page).toHaveTitle(new RegExp(text));
});

Then('I expect the page to be visually perfect', async function () {
  await this.eyes.check();
});

Then('I expect the {string} to be visually perfect', async function (selector: string) {
  await this.eyes.check({
    region: this.page.locator(selector),
  });
});

Then(
  'I expect the {string} to be visually perfect with {string} match level',
  async function (selector: string, level: MatchLevelPlain) {
    await this.eyes.check({
      region: this.page.locator(selector),
      matchLevel: level as any,
    });
  },
);
