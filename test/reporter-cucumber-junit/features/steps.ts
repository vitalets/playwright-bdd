import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Before } = createBdd();

Before({ name: 'named before hook' }, async ({}) => {});

Given('success step {int}', async ({}) => {});

Given('failing step', async ({}) => {
  expect('foo').toEqual('bar');
});
