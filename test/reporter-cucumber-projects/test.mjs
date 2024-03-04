import assert from 'node:assert/strict';
import { test, TestDir, execPlaywrightTestWithError } from '../helpers.mjs';
import { buildShape } from '../reporter-cucumber-msg/helpers/json-shape.mjs';
import {
  getMessagesFromFile,
  getJsonFromFile,
} from '../reporter-cucumber-msg/helpers/read-file.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTestWithError(testDir.name);

  assertMessagesReport();
  assertJsonReport();
});

function assertMessagesReport() {
  const actualMessages = getMessagesFromFile(testDir.getAbsPath(`reports/messages.ndjson`));
  const expectedShape = getJsonFromFile(
    testDir.getAbsPath(`expected-reports/messagesReportShape.json`),
  );
  const actualShape = buildShape(actualMessages, {
    ignorePaths: ['*'],
    valuePaths: Object.keys(expectedShape),
  });
  assert.deepEqual(actualShape, expectedShape);
}

function assertJsonReport() {
  const actualJson = getJsonFromFile(testDir.getAbsPath(`reports/report.json`));
  const expectedShape = getJsonFromFile(
    testDir.getAbsPath(`expected-reports/jsonReportShape.json`),
  );
  const actualShape = buildShape(actualJson, {
    ignorePaths: ['*'],
    valuePaths: Object.keys(expectedShape),
  });
  assert.deepEqual(actualShape, expectedShape);
}
