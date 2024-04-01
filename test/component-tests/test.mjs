import { test, TestDir, execPlaywrightTest, playwrightVersion } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name, {
    env: {
      NATIVE_MERGE_TESTS: playwrightVersion >= '1.39.0' ? '1' : '',
    },
  });
});
