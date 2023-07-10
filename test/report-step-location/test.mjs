import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(t.name, { stdio: 'pipe' });
  expect(stdout).toContain('/test/report-step-location/fixtures.ts:8:21');
});
