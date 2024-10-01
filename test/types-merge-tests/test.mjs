import { test, TestDir, execPlaywrightTest, getPackageVersion } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

const pwVersion = getPackageVersion('@playwright/test');

// mergeTests was added in pw 1.39
// See: https://playwright.dev/docs/release-notes#merge-test-fixtures
const skip = pwVersion < '1.39';

test(testDir.name, { skip }, () => {
  execPlaywrightTest(testDir.name, {
    cmd: 'npx tsc',
  });
});
