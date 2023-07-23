import { expect } from '@playwright/test';
import { createBdd } from '../../../../dist';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('State {int}', async ({ option }) => {
  expect(option).toEqual('foo');
});
