import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () =>
  execPlaywrightTestWithError(
    testDir.name,
    `When using custom "test" function in createBdd() you should`,
  ),
);
