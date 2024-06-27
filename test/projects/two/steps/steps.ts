import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('Unique step of project two', async ({ option, secondOption }) => {
  expect(option).toEqual('foo');
  expect(secondOption).toEqual('bar');
});

Given('Step defined in both projects', async () => {});
