import { expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { createBdd } from 'playwright-bdd';

const { Given, Then } = createBdd();

Given('I am on example.com', async ({ page }) => {
  await page.goto(pathToFileURL('example.html').toString());
});

Then('snapshot contains text {string}', async ({}, text: string) => {
  expect(text).toMatchSnapshot('title.txt');
});

Then('screenshot matches previous one', async ({ page }) => {
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.02,
  });
});
