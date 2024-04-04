import fs from 'node:fs';
import path from 'node:path';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';
import { expect } from '@playwright/test';

const { When, Then } = createBdd(test);

When('Action {int}', () => {});
When('Step with data table', () => {});
When('Step with doc string', () => {});

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

Then('attach stdout', async () => {
  console.log(123, 'some logs'); // eslint-disable-line no-console
  // don't test console.error b/c it poisons the output
});

When('open page {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

When('failing soft assertion {string}', async ({}, msg: string) => {
  expect.soft('xxx').toEqual(msg);
});

When('fails until retry {int}', async ({ $testInfo }, retry: number) => {
  if ($testInfo.retry < retry) {
    expect(1).toEqual(2);
  }
});

Then('page title snapshot matches the golden one', async ({ page }) => {
  expect(await page.title()).toMatchSnapshot();
});
