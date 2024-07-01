import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () =>
  execPlaywrightTestWithError(
    testDir.name,
    `createBdd() should use 'test' extended from "playwright-bdd"`,
  ),
);
