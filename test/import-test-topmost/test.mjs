import { test, TestDir, BDDGEN_CMD, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name, { cmd: BDDGEN_CMD });
});
