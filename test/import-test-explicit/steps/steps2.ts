import { expect } from '@playwright/test';
import { Given } from './fixtures2';

Given('step 2', async ({ option1, option2 }) => {
  expect(option1).toEqual('foo');
  expect(option2).toEqual('bar');
});
