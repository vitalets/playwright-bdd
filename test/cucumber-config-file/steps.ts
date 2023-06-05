import { expect } from '@playwright/test';
import { createBDD } from '../../src';

const { Given } = createBDD();

Given('state {int}', async ({}, n: number) => {
  expect(typeof n).toEqual('number');
});
