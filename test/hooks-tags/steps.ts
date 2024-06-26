import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Before, After, AfterAll } = createBdd();

const calls: string[] = [];

Before('@bar', async function ({ $testInfo, $tags }) {
  track(`Before @bar ${$testInfo.title}`);
  expect($tags).toEqual(['@foo', '@bar']);
});
Before({ tags: '@foo and not @bar' }, async ({ $testInfo }) => {
  track(`Before @foo and not @bar ${$testInfo.title}`);
});
After('@bar', async function ({ $testInfo, $tags }) {
  track(`After @bar ${$testInfo.title}`);
  expect($tags).toEqual(['@foo', '@bar']);
});
After({ tags: '@foo and not @bar' }, async ({ $testInfo }) => {
  track(`After @foo and not @bar ${$testInfo.title}`);
});

AfterAll(() => {
  // eslint-disable-next-line no-console
  console.log(['Start', ...calls, 'End'].join('\n'));
});

Given('State {int}', async ({ $testInfo }) => {
  track(`Step ${$testInfo.title}`);
});

function track(hookTitle: string) {
  calls.push(hookTitle);
}
