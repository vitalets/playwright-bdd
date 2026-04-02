import {
  test,
  TestDir,
  execPlaywrightTestWithError,
  playwrightVersion,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  execPlaywrightTestWithError(testDir.name);

  assertMessagesReport();
  assertJsonReport();
  await assertJunitReport();
});

function assertMessagesReport() {
  testDir.assertMessagesReport(
    `actual-reports/messages.ndjson`,
    `expected-reports/${getExpectedReportName('messages.ndjson')}`,
  );
}

function assertJsonReport() {
  testDir.assertJsonReport(
    `actual-reports/report.json`,
    `expected-reports/${getExpectedReportName('json-report.json')}`,
  );
}

async function assertJunitReport() {
  await testDir.assertJunitReport(`actual-reports/report.xml`, `expected-reports/junit-report.xml`);
  await testDir.assertJunitReport(
    `actual-reports/report-playwright.xml`,
    `expected-reports/junit-report-playwright.xml`,
  );
}

function getExpectedReportName(filename) {
  switch (filename) {
    case 'messages.ndjson':
      return playwrightVersion >= '1.59' ? 'messages-since-pw-1.59.ndjson' : 'messages.ndjson';
    case 'json-report.json':
      return playwrightVersion >= '1.59' ? 'json-report-since-pw-1.59.json' : 'json-report.json';
    default:
      return filename;
  }
}
