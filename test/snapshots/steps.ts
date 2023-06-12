import { expect } from '@playwright/test';
import { createBdd } from '../../dist';

const { Given, Then } = createBdd();

Given('I open url {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

Then('I see correct title', async ({ page }) => {
  expect(await page.title()).toMatchSnapshot('title.txt');
});
