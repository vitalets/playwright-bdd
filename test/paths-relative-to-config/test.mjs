import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest, expectFileExists } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(
    t.name,
    'node ../../dist/gen/cli -c subdir && npx playwright test -c subdir',
  );
  expectFileExists(import.meta, 'subdir/.features-gen/sample.feature.spec.js');
  expect(stdout).toContain('some feature › some scenario');
  expect(stdout).toContain('1 passed');
});
