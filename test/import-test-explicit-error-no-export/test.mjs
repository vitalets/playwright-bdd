import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTestWithError(testDir.name, [
    'File "steps/fixtures.ts" pointed by "importTestFrom" should export "test" variable',
  ]);
});
