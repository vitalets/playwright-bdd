import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';

const { Given } = createBdd(test);

Given('Another state {int}', async ({ someOption, anotherOption }, _state) => {
  expect(someOption).toEqual('foo');
  expect(anotherOption).toEqual('bar');
});
