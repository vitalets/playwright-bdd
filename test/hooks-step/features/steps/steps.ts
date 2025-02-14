import { expect } from '@playwright/test';
import { Given } from './fixtures';

Given('bg step', async ({ log, $testInfo }) => {
  log(`bg step of ${$testInfo.title}`);
  expect(1).toBe(1);
});

Given('step {int}', async ({ log }, n: number) => {
  log(`step ${n}`);
  expect(1).toBe(1);
});
