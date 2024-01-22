import { expect } from '@playwright/test';
import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  DEFAULT_CMD,
  PLAYWRIGHT_CMD,
} from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('reports');
  execPlaywrightTestWithError(testDir.name);

  checkHtmlReport();
});

test(`${testDir.name} (merge-reports)`, () => {
  testDir.clearDir('reports');
  testDir.clearDir('blob-report');

  // first shard fails b/c it contains failing test
  execPlaywrightTestWithError(testDir.name, '', `${DEFAULT_CMD} --shard 1/2`);
  execPlaywrightTest(testDir.name, `${PLAYWRIGHT_CMD} --shard 2/2`);
  mergeReports();

  checkHtmlReport();
});

function mergeReports() {
  execPlaywrightTest(
    testDir.name,
    `npx playwright merge-reports --config playwright.config.ts ./blob-report`,
  );
}

function checkHtmlReport() {
  expect(testDir.isFileExists('reports/report.html')).toEqual(true);
  execPlaywrightTest(testDir.name, 'npx playwright test --config check-report');
}
