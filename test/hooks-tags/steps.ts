import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Before, After, AfterAll } = createBdd();

const calls: string[] = [];

Before('@bar', async function () {
  track(`Before @bar ${this.testInfo.title}`);
  expect(this.tags).toEqual(['@foo', '@bar']);
});
Before({ tags: '@foo and not @bar' }, async ({ $bddWorld }) => {
  track(`Before @foo and not @bar ${$bddWorld.testInfo.title}`);
});
After('@bar', async function () {
  track(`After @bar ${this.testInfo.title}`);
  expect(this.tags).toEqual(['@foo', '@bar']);
});
After({ tags: '@foo and not @bar' }, async ({ $bddWorld }) => {
  track(`After @foo and not @bar ${$bddWorld.testInfo.title}`);
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
