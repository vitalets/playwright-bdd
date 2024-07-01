import { test, TestDir, BDDGEN_CMD, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [`Can't guess test instance for decorator fixture "todoPage"`],
    { cmd: BDDGEN_CMD },
  );
});
