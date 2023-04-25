const { expect } = require('@playwright/test');
const { Given, When, Then } = require('@cucumber/cucumber');

Given('I open url {string}', async function (url) {
  await this.page.goto(url);
});

When('I click link {string}', async function (name) {
  await this.page.getByRole('link', { name }).click();
});

Then('I see in title {string}', async function (keyword) {
  await expect(this.page).toHaveTitle(new RegExp(keyword));
});
