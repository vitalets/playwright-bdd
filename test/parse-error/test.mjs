import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () =>
  execPlaywrightTestWithError(testDir.name, [
    `Parse error in "sample.feature" (1:1)`,
    `got 'Feature123: Playwright site'`,
  ]),
);
