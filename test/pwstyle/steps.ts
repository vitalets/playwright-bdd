import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';

Given('state with fixtures - arrow fn', async ({ page, account }) => {
  expect(page).toBeDefined();
  expect(account).toBeDefined();
});

Given('state without fixtures - arrow fn', async () => {});

Given('state with fixtures - function', async function ({ page, account }) {
  expect(page).toBeDefined();
  expect(account).toBeDefined();
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
  async ({ page, browserName, todoPage, account, option }, arg: string) => {
    expect(page).toBeDefined();
    expect(browserName).toEqual('chromium');
    expect(todoPage.prop).toEqual('123');
    expect(account.username).toEqual('user');
    expect(option).toEqual('foo');
    expect(arg).toEqual('bar');
  },
);

Then(
  'result with fixtures and arg equals to {string} - function',
  async function ({ page, browserName, todoPage, account, option }, arg: string) {
    expect(page).toBeDefined();
    expect(browserName).toEqual('chromium');
    expect(todoPage.prop).toEqual('123');
    expect(account.username).toEqual('user');
    expect(option).toEqual('foo');
    expect(arg).toEqual('bar');
  },
);

Then('testInfo is available as a fixture', async ({ testInfo }) => {
  expect(testInfo.title).toEqual('Check fixtures');
});
