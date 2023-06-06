import { expect } from '@playwright/test';
import { createBDD } from '../../dist';

const { Given } = createBDD();

Given('state {int}', async ({}, n: number) => {
  expect(typeof n).toEqual('number');
});
