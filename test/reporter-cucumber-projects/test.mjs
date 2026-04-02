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
  const expectedReport =
    playwrightVersion >= '1.59' ? 'messages.ndjson' : 'messages-untill-pw-1.59.ndjson';
  testDir.assertMessagesReport(
    `actual-reports/messages.ndjson`,
    `expected-reports/${expectedReport}`,
  );
}

function assertJsonReport() {
  const expectedReport =
    playwrightVersion >= '1.59' ? 'json-report.json' : 'json-report-untill-pw-1.59.json';
  testDir.assertJsonReport(`actual-reports/report.json`, `expected-reports/${expectedReport}`);
}

async function assertJunitReport() {
  await testDir.assertJunitReport(`actual-reports/report.xml`, `expected-reports/junit-report.xml`);
  await testDir.assertJunitReport(
    `actual-reports/report-playwright.xml`,
    `expected-reports/junit-report-playwright.xml`,
  );
}
