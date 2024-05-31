import { expect } from '@playwright/test';
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from './world';

Given<CustomWorld>('I am on home page', async function () {
  await this.openHomePage();
});

When<CustomWorld>('I click link {string}', async function (name: string) {
  await this.clickLink(name);
});

Then<CustomWorld>('I see in title {string}', async function (text: string) {
  await expect(this.page).toHaveTitle(new RegExp(text));
});
