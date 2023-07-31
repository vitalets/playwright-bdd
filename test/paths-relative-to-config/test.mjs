import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest, expectFileExists, clearDir } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  clearDir(import.meta, 'subdir/.features-gen');
  const stdout = execPlaywrightTest(
    t.name,
    'node ../../dist/gen/cli -c subdir && npx playwright test -c subdir',
  );
  expectFileExists(import.meta, 'subdir/.features-gen/sample.feature.spec.js');
  expect(stdout).toContain('1 passed');
});
