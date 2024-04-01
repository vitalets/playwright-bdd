import {
  test,
  TestDir,
  execPlaywrightTestWithError,
  getJsonFromXmlFile,
} from '../_helpers/index.mjs';
import { assertShape } from '../reporter-cucumber-msg/helpers/json-shape.mjs';
import {
  getMessagesFromFile,
  getJsonFromFile,
} from '../reporter-cucumber-msg/helpers/read-file.mjs';
import { junitReportFields } from '../reporter-cucumber-junit/junit-report.fields.mjs';
import { messageReportFields } from '../reporter-cucumber-msg/message-report.fields.mjs';
import { jsonReportFields } from '../reporter-cucumber-msg/json-report.fields.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  execPlaywrightTestWithError(testDir.name);

  assertMessagesReport();
  assertJsonReport();
  await assertJunitReport();
});

function assertMessagesReport() {
  const actualMessages = getMessagesFromFile(testDir.getAbsPath(`actual-reports/messages.ndjson`));
  const expectedMessages = getMessagesFromFile(
    testDir.getAbsPath(`expected-reports/messages.ndjson`),
  );
  assertShape(actualMessages, expectedMessages, messageReportFields);
}

function assertJsonReport() {
  const actualJson = getJsonFromFile(testDir.getAbsPath(`actual-reports/report.json`));
  const expectedJson = getJsonFromFile(testDir.getAbsPath(`expected-reports/json-report.json`));
  assertShape(actualJson, expectedJson, jsonReportFields);
}

async function assertJunitReport() {
  const actualJson = await getJsonFromXmlFile(testDir.getAbsPath('actual-reports/report.xml'));
  const expectedJson = await getJsonFromXmlFile(
    testDir.getAbsPath('expected-reports/junit-report.xml'),
  );
  assertShape(actualJson, expectedJson, junitReportFields);
}
