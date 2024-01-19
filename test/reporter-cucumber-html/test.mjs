import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest, DEFAULT_CMD, PLAYWRIGHT_CMD } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('reports');
  execPlaywrightTest(testDir.name);

  expect(testDir.isFileExists('reports/report.html')).toEqual(true);
  assertHtmlReport();
});

test(`${testDir.name} (merge-reports)`, () => {
  testDir.clearDir('reports');
  testDir.clearDir('blob-report');

  execPlaywrightTest(testDir.name, `${DEFAULT_CMD} --shard 1/2`);
  execPlaywrightTest(testDir.name, `${PLAYWRIGHT_CMD} --shard 2/2`);
  execPlaywrightTest(
    testDir.name,
    `npx playwright merge-reports --config playwright.config.ts ./blob-report`,
  );

  expect(testDir.isFileExists('reports/report.html')).toEqual(true);
  assertHtmlReport();
});

function assertHtmlReport() {
  execPlaywrightTest(testDir.name, 'npx playwright test --config check-report');
}
