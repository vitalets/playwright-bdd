import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('state with fixtures - arrow fn', async ({ page }) => {
  expect(page).toBeDefined();
});

Given('state without fixtures - arrow fn', async () => {});

Given('state with fixtures - function', async function ({ page }) {
  expect(page).toBeDefined();
});

Given('state without fixtures - function', function () {});

When('action {int}', ({}, n: number) => {
  expect(typeof n).toEqual('number');
});

When(/^async action (\d+)$/, async ({}, n: number) => {
  expect(typeof n).toEqual('number');
});

Then(
  'result with fixtures and arg equals to {string} - arrow fn',
  async ({ page, browserName }, arg: string) => {
    expect(page).toBeDefined();
    expect(browserName).toEqual('chromium');
    expect(arg).toEqual('bar');
  },
);

Then(
  'result with fixtures and arg equals to {string} - function',
  async function ({ page, browserName }, arg: string) {
    expect(page).toBeDefined();
    expect(browserName).toEqual('chromium');
    expect(arg).toEqual('bar');
  },
);

Then(
  '$testInfo is available as a fixture and its title equals to {string}',
  async ({ $testInfo }, title: string) => {
    expect($testInfo.title).toEqual(title);
  },
);

Then(
  '$test is available as a fixture and its title equals to {string}',
  async ({ $test }, title: string) => {
    expect($test.info().title).toEqual(title);
  },
);
