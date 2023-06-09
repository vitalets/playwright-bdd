import { expect } from '@playwright/test';
import { createBdd } from '../../dist';

const { Given } = createBdd();

Given('state {int}', async ({}, n: number) => {
  expect(typeof n).toEqual('number');
});
