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

// merge-reports was added in pw 1.37
// See: https://playwright.dev/docs/release-notes#version-137
const skip = playwrightVersion < '1.37';

test(testDir.name, { skip }, () => {
  testDir.clearDir('actual-reports');
  testDir.clearDir('blob-report');

  copyFeatures(); // uses features from reporter-cucumber-html
  execShard1();
  execShard2();
  mergeReports();

  checkHtmlReport();
});

function execShard1() {
  execPlaywrightTestWithError(testDir.name, '', {
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
  fs.cpSync(
    'test/reporter-cucumber-html/.features-gen/features/sample.feature.spec.js-snapshots',
    testDir.getAbsPath('.features-gen/features/sample.feature.spec.js-snapshots'),
    {
      recursive: true,
    },
  );
}
