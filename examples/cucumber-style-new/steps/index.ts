import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  await this.openHomePage();
});

When('I click link {string}', async function (name: string) {
  await this.clickLink(name);
});

Then('I see in title {string}', async function (text: string) {
  await expect(this.page).toHaveTitle(new RegExp(text));
});
