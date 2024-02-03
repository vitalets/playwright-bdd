import { expect } from '@playwright/test';
import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  getPackageVersion,
  DEFAULT_CMD,
} from '../helpers.mjs';

const testDir = new TestDir(import.meta);

const pwVersion = getPackageVersion('@playwright/test');

// merge-reports was added in pw 1.37
// See: https://playwright.dev/docs/release-notes#version-137
const skip = pwVersion < '1.37';

test(testDir.name, { skip }, () => {
  testDir.clearDir('reports');
  testDir.clearDir('blob-report');

  // first shard fails b/c it contains failing tests
  execPlaywrightTestWithError(testDir.name, '', {
    cmd: `${DEFAULT_CMD} --shard 1/2`,
    env: { PWTEST_BLOB_DO_NOT_REMOVE: '1' },
  });

  execPlaywrightTest(testDir.name, {
    cmd: `${DEFAULT_CMD} --shard 2/2`,
    env: { PWTEST_BLOB_DO_NOT_REMOVE: '1' },
  });
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
  execPlaywrightTest(
    testDir.name,
    'npx playwright test --config ../reporter-cucumber-html/check-report',
  );
}
