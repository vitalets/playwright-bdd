import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Then } = createBdd();

Given('I am on example.com', async ({ page }) => {
  await page.goto('https://example.com');
});

Then('snapshot contains text {string}', async ({}, text: string) => {
  expect(text).toMatchSnapshot('title.txt');
});

Then('screenshot matches previous one', async ({ page }) => {
  await expect(page).toHaveScreenshot();
});
