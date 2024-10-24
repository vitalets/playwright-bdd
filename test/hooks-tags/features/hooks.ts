import { expect } from '@playwright/test';
import { Before, After, AfterAll } from './fixtures';

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

export function track(hookTitle: string) {
  calls.push(hookTitle);
}
