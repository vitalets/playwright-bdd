import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When } = createBdd();

Given('success step {int}', async () => {});

When('failed step', () => {
  expect(1).toEqual(2);
});
