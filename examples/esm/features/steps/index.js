import { expect } from '@playwright/test';
import { Given, When, Then } from '@cucumber/cucumber';

Given('I open url {string}', async function (url) {
  await this.page.goto(url);
});

When('I click link {string}', async function (name) {
  await this.page.getByRole('link', { name }).click();
});

Then('I see in title {string}', async function (keyword) {
  await expect(this.page).toHaveTitle(new RegExp(keyword));
});
