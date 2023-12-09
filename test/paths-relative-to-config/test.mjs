import { expect } from '@playwright/test';
import { test, execPlaywrightTest, TestDir, BDDGEN_CMD, PLAYWRIGHT_CMD } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('subdir/.features-gen');
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} -c subdir && ${PLAYWRIGHT_CMD} -c subdir`,
  );
  expect(testDir.isFileExists('subdir/.features-gen/sample.feature.spec.js')).toEqual(true);
  expect(stdout).toContain('1 passed');
});
