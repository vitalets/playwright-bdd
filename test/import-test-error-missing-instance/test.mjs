import { test, TestDir, BDDGEN_CMD, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [`Can't guess test instance for: sample.feature`, `Did you include all fixture files`],
    { cmd: BDDGEN_CMD },
  );
});
