import { expect } from '@playwright/test';
import { createBdd } from '../../dist';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test);

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
    expect(todoPage.prop).toBeDefined();
    expect(account).toBeDefined();
    expect(option).toEqual('foo');
    expect(arg).toEqual('bar');
  },
);

Then(
  'result with fixtures and arg equals to {string} - function',
  async function ({ page, browserName, todoPage, account, option }, arg: string) {
    expect(page).toBeDefined();
    expect(browserName).toEqual('chromium');
    expect(todoPage.prop).toBeDefined();
    expect(account).toBeDefined();
    expect(option).toEqual('foo');
    expect(arg).toEqual('bar');
  },
);

Then(
  '$testInfo is available as a fixture and its title equals to {string}',
  async ({ $testInfo }, title: string) => {
    expect($testInfo).toBeDefined();
    expect($testInfo.title).toEqual(title);
  },
);

Then(
  '$test is available as a fixture and test.info\\().title equals to {string}',
  async ({ $test }, title: string) => {
    expect($test).toBeDefined();
    expect($test.skip).toBeDefined();
    expect($test.info().title).toEqual(title);
  },
);

When('update todoPage prop to {string}', async ({ todoPage }, prop: string) => {
  todoPage.prop = prop;
});

Then('todoPage prop equals to {string}', async ({ todoPage }, prop: string) => {
  expect(todoPage.prop).toEqual(prop);
});

When('update account username to {string}', async ({ account }, name: string) => {
  account.username = name;
});

Then('account username equals to {string}', async ({ account }, name: string) => {
  expect(account.username).toEqual(name);
});
