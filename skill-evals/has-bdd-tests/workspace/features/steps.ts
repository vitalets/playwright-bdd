import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures.ts';

Given('I have an empty todo list', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem')).toHaveCount(0);
});

When('I add the task {string}', async ({ page }, title: string) => {
  await page.getByRole('textbox', { name: 'New task' }).fill(title);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
});

When('I complete the task {string}', async ({ page }, title: string) => {
  await page.getByRole('checkbox', { name: title, exact: true }).check();
});

Then('my todo list contains {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('checkbox', { name: title, exact: true })).toBeVisible();
});

Then('the task {string} is completed', async ({ page }, title: string) => {
  await expect(page.getByRole('checkbox', { name: title, exact: true })).toBeChecked();
});
