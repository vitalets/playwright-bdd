import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest, execPlaywrightTestWithError } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('reports');
  execPlaywrightTestWithError(testDir.name);
  checkHtmlReport();
});

function checkHtmlReport() {
  expect(testDir.isFileExists('reports/report.html')).toEqual(true);
  execPlaywrightTest(testDir.name, 'npx playwright test --config check-report');
}
