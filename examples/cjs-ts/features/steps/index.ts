import { expect } from '@playwright/test';
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from './world';

Given('I open url {string}', async function (this: CustomWorld, url: string) {
  await this.page.goto(url);
});

When('I click link {string}', async function (this: CustomWorld, name: string) {
  await this.page.getByRole('link', { name }).click();
});

Then(
  'I see in title {string}',
  async function (this: CustomWorld, keyword: string) {
    await expect(this.page).toHaveTitle(new RegExp(keyword));
  },
);
