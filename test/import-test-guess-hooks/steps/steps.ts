import { expect } from '@playwright/test';
import { Given, BeforeAll, Before } from './fixtures';

Given('step {int}', async ({ option1 }) => {
  expect(option1).toEqual('foo');
});

BeforeAll(async ({ option2 }) => {
  expect(option2).toEqual('bar');
});

Before({ tags: '@foo' }, async ({ option1, option2, option3 }) => {
  expect(option1).toEqual('foo');
  expect(option2).toEqual('bar');
  expect(option3).toEqual('baz');
});
