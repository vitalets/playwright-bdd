import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest, execPlaywrightTestWithError } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('actual-reports');
  testDir.clearDir('test-results');
  execPlaywrightTestWithError(testDir.name);
  checkHtmlReport();
});

function checkHtmlReport() {
  expect(testDir.isFileExists('actual-reports/report.html')).toEqual(true);
  execPlaywrightTest(testDir.name, 'npx playwright test --config check-report');
}
