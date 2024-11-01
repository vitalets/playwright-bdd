import { test, TestDir, expect, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');

  execPlaywrightTest(testDir.name);

  const report = JSON.parse(testDir.getFileContents('actual-reports/report.json'));
  // scenario 1
  expect(report[0].elements[0].steps[0]).toHaveProperty('result.status', 'skipped');
  // scenario 2
  expect(report[0].elements[1].steps[0]).toHaveProperty('result.status', 'skipped');
  expect(report[0].elements[1].steps[1]).toHaveProperty('result.status', 'skipped');
});
