import { test, TestDir, expect, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTestWithError(testDir.name);

  const report = JSON.parse(testDir.getFileContents('actual-reports/report.json'));
  // only failed scenario in report, 2 are skipped
  expect(report[0].elements.length).toBe(1);
  expect(report[0].elements[0].name).toBe('failing scenario');
});
