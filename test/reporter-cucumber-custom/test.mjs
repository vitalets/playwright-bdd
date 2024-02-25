import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('reports');
  const stdout = execPlaywrightTest(testDir.name);
  checkCustomFormatter('reports/custom.ndjson');
  checkPrettyFormatter(stdout);
});

function checkCustomFormatter(outputFile) {
  expect(testDir.isFileExists(outputFile)).toEqual(true);
}

function checkPrettyFormatter(stdout) {
  expect(stdout).toContain('Feature: a feature # features/sample.feature:1');
}
