import { expect } from '@playwright/test';
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from './world';

Given('I am on home page', async function (this: CustomWorld) {
  await this.openHomePage();
});

When('I click link {string}', async function (this: CustomWorld, name: string) {
  await this.clickLink(name);
});

Then('I see in title {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page).toHaveTitle(new RegExp(text));
});
