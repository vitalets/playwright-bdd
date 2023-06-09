import { expect } from '@playwright/test';
import { createBDD } from '../../../dist';
import { test } from './fixtures';

const { Given } = createBDD(test);

Given('Another state {int}', async ({ page, option, secondOption }) => {
  expect(page).toBeDefined();
  expect(option).toEqual('foo');
  expect(secondOption).toEqual('bar');
});
