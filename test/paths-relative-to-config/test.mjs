import { expect } from '@playwright/test';
import { test, execPlaywrightTest, TestDir } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('subdir/.features-gen');
  const stdout = execPlaywrightTest(
    testDir.name,
    'node ../../dist/cli -c subdir && npx playwright test -c subdir',
  );
  expect(testDir.isFileExists('subdir/.features-gen/sample.feature.spec.js')).toEqual(true);
  expect(stdout).toContain('1 passed');
});
