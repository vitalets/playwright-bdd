import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('success step {int}', async () => {});

Given('failing step', async ({}) => {
  expect('foo').toEqual('bar');
});
