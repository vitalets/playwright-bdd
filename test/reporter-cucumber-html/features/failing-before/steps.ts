import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Before } = createBdd(test);

// 'page' arg is important to have a screenshot in the report
Before({ tags: '@failing-anonymous-before-hook' }, async ({ page }) => {
  await expect(page).toHaveTitle('foo');
});

Before(
  { name: 'failing named before hook', tags: '@failing-named-before-hook' },
  async ({ page }) => {
    await expect(page).toHaveTitle('foo');
  },
);

Before(
  { name: 'my timeouted hook', tags: '@before-hook-with-timeout' },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ({ page, $testInfo }) => {
    await new Promise((r) => setTimeout(r, $testInfo.timeout + 100));
  },
);

Given('step that uses fixtureWithErrorInSetup', async ({ fixtureWithErrorInSetup }) => {
  return fixtureWithErrorInSetup;
});

Given('step that uses fixtureWithErrorInSetupStep', async ({ fixtureWithErrorInSetupStep }) => {
  return fixtureWithErrorInSetupStep;
});

Given('step that uses fixtureWithTimeoutInSetup', async ({ fixtureWithTimeoutInSetup }) => {
  return fixtureWithTimeoutInSetup;
});
