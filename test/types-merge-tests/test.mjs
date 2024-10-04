import { test, TestDir, execPlaywrightTest, playwrightVersion } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// mergeTests was added in pw 1.39
// See: https://playwright.dev/docs/release-notes#merge-test-fixtures
const skip = playwrightVersion < '1.39';

test(testDir.name, { skip }, () => {
  execPlaywrightTest(testDir.name, {
    cmd: 'npx tsc',
  });
});
