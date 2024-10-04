import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

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
    `expected-reports/messages.ndjson`,
  );
}

function assertJsonReport() {
  testDir.assertJsonReport(`actual-reports/report.json`, `expected-reports/json-report.json`);
}

async function assertJunitReport() {
  await testDir.assertJunitReport(`actual-reports/report.xml`, `expected-reports/junit-report.xml`);
}
