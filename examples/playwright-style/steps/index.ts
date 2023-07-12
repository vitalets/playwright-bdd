import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test);

Given('I am on home page', async ({ homePage }) => {
  await homePage.open();
});

When('I click link {string}', async ({ homePage }, name: string) => {
  await homePage.clickLink(name);
});

Then('I see in title {string}', async ({ page }, text: string) => {
  await expect(page).toHaveTitle(new RegExp(text));
});
