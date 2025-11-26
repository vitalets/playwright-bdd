/**
 * Generate Cucumber HTML reporter and check the report via Playwright.
 * To check particular scenario:
 * 1. add @only tag to the scenario
 * 2. comment checkHtmlReport() call in this file
 *    OR
 *    add `test.only` to the related spec file in check-report directory
 * 3. if running only success test, use execPlaywrightTest() instead of execPlaywrightTestWithError()
 *
 */
import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  playwrightVersion,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// In PW 1.55-1.56 there is a warning in stdout:
// See: https://github.com/microsoft/playwright/issues/37147
const error =
  playwrightVersion >= '1.55' && playwrightVersion < '1.57'
    ? 'Internal error: step id not found'
    : '';

test(testDir.name, () => {
  testDir.clearDir('actual-reports');
  testDir.clearDir('test-results');

  execPlaywrightTestWithError(testDir.name, error);
  // useful for debug
  // execPlaywrightTest(testDir.name);

  checkHtmlReport();
});

function checkHtmlReport() {
  testDir.expectFileNotEmpty('actual-reports/report.html');
  execPlaywrightTest(testDir.name, 'npx playwright test --config check-report');
}
