import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(t.name);
  expect(stdout).toContain(
    `I am on home page ${normalize('.features-gen/sample.feature.spec.js')}:7:11`,
  );
  expect(stdout).toContain('page.goto(https://example.com) fixtures.ts:8:21');
});
