import { test, TestDir, expect, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTestWithError(testDir.name);

  const report = JSON.parse(testDir.getFileContents('actual-reports/report.json'));

  expect(report[0].elements).toHaveLength(2); // 2 scenarios
  expect(report[0].elements[0]).toHaveProperty('name', 'failing scenario');
  expect(report[0].elements[0].steps[0]).toHaveProperty('result.status', 'passed');
  expect(report[0].elements[1]).toHaveProperty('name', 'success scenario (will be skipped)');
  expect(report[0].elements[1].steps[0]).toHaveProperty('result.status', 'skipped');
});
