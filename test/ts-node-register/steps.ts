import { expect } from '@playwright/test';
import { createBdd } from '../../dist';
import { test } from './fixtures';

const { Then } = createBdd(test);

Then('Passed string arg {string} to equal "foo"', async ({}, arg: string) => {
  expect(arg).toEqual('foo');
});
