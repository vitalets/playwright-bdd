import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import test from './fixtures1.js';

const { Given } = createBdd(test);

Given('State {int}', async ({ someOption }) => {
  expect(someOption).toEqual('foo');
});
