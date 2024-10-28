import { expect } from '@playwright/test';
import { Given, Before, After } from './fixtures';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Before('@bar', async function ({ $testInfo, $tags, track, fixtureForBar }) {
  track(`Before @bar ${$testInfo.title}`);
  expect($tags).toEqual(['@foo', '@bar']);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Before({ tags: '@foo and not @bar' }, async ({ $testInfo, track, fixtureForFoo }) => {
  track(`Before @foo and not @bar ${$testInfo.title}`);
});

After('@bar', async function ({ $testInfo, $tags, track }) {
  track(`After @bar ${$testInfo.title}`);
  expect($tags).toEqual(['@foo', '@bar']);
});

After({ tags: '@foo and not @bar' }, async ({ $testInfo, track }) => {
  track(`After @foo and not @bar ${$testInfo.title}`);
});

Given('Step {int}', async ({ $step, track }) => {
  track($step.title);
});
