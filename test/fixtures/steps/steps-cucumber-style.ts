import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { When, Then } = createBdd(test, { worldFixture: 'world' });

When('testScopedFixture set prop to {string}', async function (value: string) {
  this.testScopedFixture.prop = value;
});

Then('testScopedFixture prop equals to {string}', async function (value: string) {
  expect(this.testScopedFixture.prop).toEqual(value);
});

When('workerScopedFixture set prop to {string}', async function (value: string) {
  this.workerScopedFixture.prop = value;
});

Then('workerScopedFixture prop equals to {string}', async function (value: string) {
  expect(this.workerScopedFixture.prop).toEqual(value);
});
