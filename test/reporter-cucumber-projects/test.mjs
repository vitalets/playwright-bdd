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
    playwrightVersion >= '1.59' ? 'messages.ndjson' : 'messages-until-pw-1.59.ndjson';
  testDir.assertMessagesReport(
    `actual-reports/messages.ndjson`,
    `expected-reports/${expectedReport}`,
    {
      // Some dependency combinations omit these optional fields.
      'attachment.timestamp.seconds': null,
      'attachment.timestamp.nanos': null,
      'pickle.location.line': null,
      'pickle.location.column': null,
    },
  );
}

function assertJsonReport() {
  const expectedReport =
    playwrightVersion >= '1.59' ? 'json-report.json' : 'json-report-until-pw-1.59.json';
  testDir.assertJsonReport(`actual-reports/report.json`, `expected-reports/${expectedReport}`);
}

async function assertJunitReport() {
  await testDir.assertJunitReport(`actual-reports/report.xml`, `expected-reports/junit-report.xml`);
}
