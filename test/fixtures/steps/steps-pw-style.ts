import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test);

Given('fixtures available in arrow fn', async ({ page, testScopedFixture }) => {
  expect(page).toBeDefined();
  expect(testScopedFixture).toBeDefined();
});

Then('fixtures available in normal fn', async function ({ page, testScopedFixture }) {
  expect(page).toBeDefined();
  expect(testScopedFixture).toBeDefined();
});

Then('empty fixtures in arrow fn', async () => {});
Then('empty fixtures 2 in arrow fn', async ({}) => {});
Then('empty fixtures in normal fn', function () {});
Then('empty fixtures 2 in normal fn', function ({}) {});
Then('empty fixtures with int param {int}', ({}, n: number) => {
  expect(typeof n).toEqual('number');
});

Then('bdd-fixtures should be defined', async ({ $test, $step, $testInfo }) => {
  expect($testInfo.title).toEqual('playwright-bdd built-in fixtures');
  expect($test.info().title).toEqual('playwright-bdd built-in fixtures');
  expect($step.title).toEqual('bdd-fixtures should be defined');
});

When('testScopedFixture set prop to {string}', async ({ testScopedFixture }, value: string) => {
  testScopedFixture.prop = value;
});

Then('testScopedFixture prop equals to {string}', async ({ testScopedFixture }, value: string) => {
  expect(testScopedFixture.prop).toEqual(value);
});

When('workerScopedFixture set prop to {string}', async ({ workerScopedFixture }, value: string) => {
  workerScopedFixture.prop = value;
});

Then(
  'workerScopedFixture prop equals to {string}',
  async ({ workerScopedFixture }, value: string) => {
    expect(workerScopedFixture.prop).toEqual(value);
  },
);
