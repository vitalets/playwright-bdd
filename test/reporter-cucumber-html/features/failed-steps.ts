import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Before, After } = createBdd(test);

Before({ name: 'failing named before hook', tags: '@failing-named-hook' }, async ({ page }) => {
  await expect(page).toHaveTitle('Some title1');
});

Before({ tags: '@failing-anonymous-hook' }, async ({ page }) => {
  await expect(page).toHaveTitle('Some title2');
});

Given('step that uses failingBeforeFixtureNoStep', async ({ failingBeforeFixtureNoStep }) => {
  failingBeforeFixtureNoStep;
});

Given('step that uses failingBeforeFixtureWithStep', async ({ failingBeforeFixtureWithStep }) => {
  failingBeforeFixtureWithStep;
});

Given('step that uses failingAfterFixtureNoStep', async ({ failingAfterFixtureNoStep }) => {
  failingAfterFixtureNoStep;
});

Given('step that uses failingAfterFixtureWithStep', async ({ failingAfterFixtureWithStep }) => {
  failingAfterFixtureWithStep;
});

Given('step failing for scenario {string}', async ({ $testInfo }, title: string) => {
  if ($testInfo.title === title) expect(true).toEqual(false);
});

Given('failing step', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page.getByText('missing string')).toBeVisible();
});

Given('timeouted step', async ({ $testInfo }) => {
  await new Promise((r) => setTimeout(r, $testInfo.timeout + 100));
});

Given('step that uses timeouted before fixture', async ({ timeoutedBeforeFixture }) => {
  timeoutedBeforeFixture;
});

Given('step that uses timeouted after fixture', async ({ timeoutedAfterFixture }) => {
  timeoutedAfterFixture;
});

Before({ name: 'success before hook', tags: '@success-before-hook' }, async ({}) => {});

After({ name: 'success after hook', tags: '@success-after-hook' }, async ({}) => {});
