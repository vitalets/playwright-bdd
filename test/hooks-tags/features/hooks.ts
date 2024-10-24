/* eslint-disable @typescript-eslint/no-unused-vars */

import { expect } from '@playwright/test';
import { Before, After, AfterAll } from './fixtures';
import { track, calls } from './track';

const logger = console;

Before('@bar', async function ({ $testInfo, $tags, fixtureForBar }) {
  track(`Before @bar ${$testInfo.title}`);
  expect($tags).toEqual(['@foo', '@bar']);
});

Before({ tags: '@foo and not @bar' }, async ({ $testInfo, fixtureForFoo }) => {
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
  logger.log(['Start', ...calls, 'End'].join('\n'));
});
