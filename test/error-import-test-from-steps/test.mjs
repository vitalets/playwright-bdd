import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () =>
  execPlaywrightTestWithError(testDir.name, [
    `Option "importTestFrom" should point to a separate file`,
    /Given, When, Then\)$/, // no other text after error
  ]),
);
