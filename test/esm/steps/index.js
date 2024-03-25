import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';

const { Given } = createBdd(test);

Given('State {int}', async ({ someOption, todoPage }) => {
  expect(someOption).toEqual('foo');
  expect(todoPage).toBeDefined();
});
