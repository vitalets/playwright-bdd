import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('State {int}', async ({ option }, _state: number) => {
  expect(option).toEqual('foo');
});
