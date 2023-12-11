import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('Another state {int}', async ({ option, secondOption }) => {
  expect(option).toEqual('foo');
  expect(secondOption).toEqual('bar');
});
