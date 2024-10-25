import { expect } from '@playwright/test';
import { Given, Before } from './fixtures';

Given('step {int}', async ({ option1 }) => {
  expect(option1).toEqual('foo');
});

Before({ tags: '@foo' }, async ({ option1, option2 }) => {
  expect(option1).toEqual('foo');
  expect(option2).toEqual('bar');
});
