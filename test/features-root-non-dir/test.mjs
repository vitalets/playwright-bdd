import { test, execPlaywrightTestWithError, TestDir } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTestWithError(testDir.name, [
    `Config option 'featuresRoot' should be a directory`, // prettier-ignore
  ]);
});
