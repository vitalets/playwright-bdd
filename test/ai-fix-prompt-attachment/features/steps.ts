import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { pathToFileURL } from 'node:url';

const { Given, Then } = createBdd();

Given('I am on homepage', async ({ page }) => {
  await page.goto(pathToFileURL('example.html').toString());
});

Then('failing step', async ({ page }) => {
  await expect(page.getByRole('heading')).toContainText('xxx', { timeout: 100 });
});

Then('failing step on custom page fixture', async ({ context, $prompt }) => {
  const newPage = await context.newPage();
  await newPage.goto(pathToFileURL('example.html').toString());
  $prompt.setPage(newPage); // <-- call $prompt.setPage() to switch the page
  await expect(newPage.getByRole('heading')).toContainText('xxx', { timeout: 100 });
});

Then('I close default page and trigger error', async ({ page }) => {
  await page.close();
  expect('foo').toEqual('bar');
});
