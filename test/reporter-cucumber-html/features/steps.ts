import { expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

When('Action {int}', () => {});
When('Step with data table', () => {});
When('Step with doc string', () => {});

Given('failing step', async ({ page }) => {
  await page.goto('https://example.com');
  expect(1).toEqual(2);
});

When('attach text', async ({ $testInfo }) => {
  await $testInfo.attach('text attachment', { body: 'some text' });
});

When('attach image inline', async ({ $testInfo }) => {
  await $testInfo.attach('image attachment inline', {
    body: fs.readFileSync(path.join(__dirname, 'cucumber.png')),
    contentType: 'image/png',
  });
});

Then('attach image as file', async ({ $testInfo }) => {
  await $testInfo.attach('image attachment as file', {
    path: path.join(__dirname, 'cucumber.png'),
    contentType: 'image/png',
  });
});
