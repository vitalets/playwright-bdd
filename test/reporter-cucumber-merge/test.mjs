import fs from 'node:fs';
import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  playwrightVersion,
  DEFAULT_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

// In PW 1.55 there is a warning in stdout
// See: https://github.com/microsoft/playwright/issues/37147
// TODO: remove this workaround when fixed in Playwright
const error = playwrightVersion >= '1.55' ? 'Internal error: step id not found' : '';

test(testDir.name, () => {
  testDir.clearDir('actual-reports');
  testDir.clearDir('blob-report');
  testDir.clearDir('check-report');
  testDir.clearDir('features');
  testDir.clearDir('.features-gen');

  copyFeatures(); // uses features from reporter-cucumber-html
  execShard1();
  execShard2();
  mergeReports();

  checkHtmlReport();
});

function execShard1() {
  execPlaywrightTestWithError(testDir.name, error, {
    cmd: `${DEFAULT_CMD} --shard=1/2`,
    env: { PWTEST_BLOB_DO_NOT_REMOVE: '1' },
  });
}

function execShard2() {
  execPlaywrightTestWithError(testDir.name, '', {
    cmd: `${DEFAULT_CMD} --shard 2/2`,
    env: { PWTEST_BLOB_DO_NOT_REMOVE: '1' },
  });
}

function mergeReports() {
  execPlaywrightTest(
    testDir.name,
    `npx playwright merge-reports --config playwright.config.ts ./blob-report`,
  );
}

function checkHtmlReport() {
  testDir.expectFileNotEmpty('actual-reports/report.html');
  execPlaywrightTest(testDir.name, 'npx playwright test --config ./check-report');
}

function copyFeatures() {
  fs.cpSync('test/reporter-cucumber-html/features', testDir.getAbsPath('features'), {
    recursive: true,
  });
  fs.cpSync('test/reporter-cucumber-html/check-report', testDir.getAbsPath('check-report'), {
    recursive: true,
  });
  const snapshotsDir = '.features-gen/failing-steps/error.feature.spec.js-snapshots';
  fs.cpSync(`test/reporter-cucumber-html/${snapshotsDir}`, testDir.getAbsPath(snapshotsDir), {
    recursive: true,
  });
}
