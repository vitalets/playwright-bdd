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

Then('failing test on custom page fixture', async ({ context, page, $prompt }) => {
  const newPage = await context.newPage();
  await newPage.goto(pathToFileURL('example.html').toString());
  $prompt.setPage(newPage); // <-- call $prompt.setPage() to switch the page
  await page.close();
  await expect(newPage.getByRole('heading')).toContainText('xxx');
});
