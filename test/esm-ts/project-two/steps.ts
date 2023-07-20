import { expect } from '@playwright/test';
import { createBdd } from '../../../dist/index.js';
import { test } from './fixtures.js';

const { Given } = createBdd(test);

Given('Another state {int}', async ({ page, option, secondOption }) => {
  expect(page).toBeDefined();
  expect(option).toEqual('foo');
  expect(secondOption).toEqual('bar');
});
