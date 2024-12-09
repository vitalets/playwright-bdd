/**
 * Generate Cucumber HTML reporter and check the report via Playwright.
 * To check particular scenario:
 * 1. add @only tag to the scenario
 * 2. add `test.only` to the related spec file in check-report directory
 */
import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('actual-reports');
  testDir.clearDir('test-results');
  execPlaywrightTestWithError(testDir.name);
  checkHtmlReport();
});

function checkHtmlReport() {
  testDir.expectFileNotEmpty('actual-reports/report.html');
  execPlaywrightTest(testDir.name, 'npx playwright test --config check-report');
}
