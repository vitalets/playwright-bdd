import { test, TestDir, execPlaywrightTest, DEFAULT_CMD } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name);
  execPlaywrightTest(testDir.name, `${DEFAULT_CMD} --project=project-two`);
});
