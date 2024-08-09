import fs from 'fs';
import { test, expect, execPlaywrightTest, TestDir, BDDGEN_CMD } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (global)`, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} -h`);

  const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  expect(stdout).toContain(version);
  expect(stdout).toContain('-c, --config');
  expect(stdout).toContain('test [options]');
});

test(`${testDir.name} (test)`, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} test -h`);

  expect(stdout).toContain('--tags');
  expect(stdout).toContain('-c, --config');
});
