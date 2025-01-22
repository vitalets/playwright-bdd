import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { pathToFileURL } from 'node:url';

const { Given, Then } = createBdd();

Given('I am on homepage', async ({ page }) => {
  await page.goto(pathToFileURL('example.html').toString());
});

Then('I see header {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 500 });
});
