import fs from 'fs';
import { test, expect, execPlaywrightTest, TestDir, BDDGEN_CMD } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} --version`);

  const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  expect(stdout).toContain(version);
});
