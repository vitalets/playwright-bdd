import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Then } = createBdd(test);

Then('Passed string arg {string} to equal "foo"', async ({}, arg: string) => {
  expect(arg).toEqual('foo');
});
