import path from 'node:path';
import { test, TestDir, execPlaywrightTest, expect } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  const stdout = execPlaywrightTest(testDir.name);
  testDir.expectFileNotEmpty('actual-reports/custom.ndjson');
  checkPrettyFormatter(stdout);
});

function checkPrettyFormatter(stdout) {
  expect(stdout).toContain(`Feature: a feature # ${path.normalize('features/sample.feature')}:1`);
}
