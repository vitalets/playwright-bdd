import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import test from './fixtures';

const { Given } = createBdd(test);

Given('step 1', async ({ option1 }) => {
  expect(option1).toEqual('foo');
});
