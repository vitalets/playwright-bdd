import { expect } from '@playwright/test';
import { createBdd } from '../../../dist';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('Another state {int}', async ({ page, option, secondOption }) => {
  expect(page).toBeDefined();
  expect(option).toEqual('foo');
  expect(secondOption).toEqual('bar');
});
