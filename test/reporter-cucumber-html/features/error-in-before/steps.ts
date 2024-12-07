import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Before } = createBdd(test);

Before({ name: 'failing named before hook', tags: '@failing-named-hook' }, async ({ page }) => {
  await expect(page).toHaveTitle('Some title1');
});

Before({ tags: '@failing-anonymous-hook' }, async ({ page }) => {
  await expect(page).toHaveTitle('Some title2');
});

Given('step that uses fixtureWithErrorInSetup', async ({ fixtureWithErrorInSetup }) => {
  return fixtureWithErrorInSetup;
});

Given('step that uses fixtureWithErrorInSetupStep', async ({ fixtureWithErrorInSetupStep }) => {
  return fixtureWithErrorInSetupStep;
});

Given('step that uses fixtureWithTimeoutInSetup', async ({ fixtureWithTimeoutInSetup }) => {
  return fixtureWithTimeoutInSetup;
});
