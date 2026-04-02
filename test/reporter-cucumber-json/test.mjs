import {
  test,
  TestDir,
  execPlaywrightTestWithError,
  playwrightVersion,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTestWithError(testDir.name);

  testDir.assertJsonReport(
    `actual-reports/json-report.json`,
    `expected-reports/${getExpectedReportName()}`,
  );
});

function getExpectedReportName() {
  return playwrightVersion >= '1.59' ? 'json-report.json' : 'json-report-until-pw-1.59.json';
}
