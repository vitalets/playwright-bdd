import {
  test,
  TestDir,
  playwrightVersion,
  execPlaywrightTest,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// Aria snapshots appeared in Playwright 1.49
const skip = playwrightVersion < '1.49.0';

test(testDir.name, { skip }, async () => {
  execPlaywrightTestWithError(testDir.name);

  checkHtmlReport();
});

function checkHtmlReport() {
  testDir.expectFileNotEmpty('actual-reports/report.html');
  execPlaywrightTest(testDir.name, 'npx playwright test --config check-report');
}
