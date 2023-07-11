import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(t.name, { stdio: 'pipe' });
  expect(stdout).toContain('I am on home page .features-gen/sample.feature.spec.js:7:11');
  expect(stdout).toContain('page.goto(https://example.com) fixtures.ts:8:21');
});
