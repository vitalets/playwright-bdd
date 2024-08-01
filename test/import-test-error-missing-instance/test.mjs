import { test, TestDir, BDDGEN_CMD, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Can't guess test instance for: sample.feature`, // prettier-ignore
      `Your tests use custom test instance`,
    ],
    { cmd: BDDGEN_CMD },
  );
});
