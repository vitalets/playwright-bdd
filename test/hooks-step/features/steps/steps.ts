import { expect } from '@playwright/test';
import timers from 'node:timers/promises';
import { Given } from './fixtures';

Given('bg step', async ({ log, $testInfo }) => {
  log(`bg step of ${$testInfo.title}`);
  expect(1).toBe(1);
});

Given('step {int}', async ({ log }, n: number) => {
  log(`step ${n}`);
  expect(1).toBe(1);
});

Given('step with error', async ({ log }) => {
  log(`step with error`);
  expect(1).toBe(2);
});

Given('step with skip', async ({ log, $testInfo }) => {
  log(`step with skip`);
  $testInfo.skip();
});

Given('step with timeout', async ({ log, $testInfo }) => {
  log(`step with timeout`);
  await timers.setTimeout($testInfo.timeout + 100);
});
