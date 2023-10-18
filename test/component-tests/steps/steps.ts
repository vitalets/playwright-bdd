import { expect } from '@playwright/test';
import { createBdd } from '../../../dist';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test);

Given('State {int}', async () => {
  // noop
});

When('Action {int}', () => {
  // noop
});

Then('Passed int arg {int} to equal 42', ({}, arg: number) => {
  expect(arg).toEqual(42);
});
