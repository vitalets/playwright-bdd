import { expect } from '@playwright/test';
import { Given } from './fixtures1';

Given('step 1', async ({ option1 }) => {
  expect(option1).toEqual('foo');
});
