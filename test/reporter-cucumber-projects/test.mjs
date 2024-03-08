import { test, TestDir, execPlaywrightTestWithError, getJsonFromXmlFile } from '../helpers.mjs';
import { assertShape } from '../reporter-cucumber-msg/helpers/json-shape.mjs';
import {
  getMessagesFromFile,
  getJsonFromFile,
} from '../reporter-cucumber-msg/helpers/read-file.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  execPlaywrightTestWithError(testDir.name);

  assertMessagesReport();
  assertJsonReport();
  await assertJunitReport();
});

function assertMessagesReport() {
  const actualMessages = getMessagesFromFile(testDir.getAbsPath(`reports/messages.ndjson`));
  const expectedMessages = getMessagesFromFile(
    testDir.getAbsPath(`expected-reports/messages.ndjson`),
  );
  assertShape(actualMessages, expectedMessages, {
    valuePaths: [
      'source.uri', // prettier-ignore
      'gherkinDocument.uri',
      'pickle.uri',
      'testStepFinished.testStepResult.status',
      'testRunFinished.success',
    ],
  });
}

function assertJsonReport() {
  const actualJson = getJsonFromFile(testDir.getAbsPath(`reports/report.json`));
  const expectedJson = getJsonFromFile(testDir.getAbsPath(`expected-reports/json-report.json`));
  assertShape(actualJson, expectedJson, {
    valuePaths: [
      'id', // prettier-ignore
      'name',
      'uri',
      'elements.#.steps.#.result.status',
      'metadata.#.name',
      'metadata.#.value',
    ],
  });
}

async function assertJunitReport() {
  const actualJson = await getJsonFromXmlFile(testDir.getAbsPath('reports/report.xml'));
  const expectedJson = await getJsonFromXmlFile(
    testDir.getAbsPath('expected-reports/junit-report.xml'),
  );
  assertShape(actualJson, expectedJson, {
    valuePaths: [
      'testsuite.testcase.#.$.name', // prettier-ignore
      'testsuite.testcase.#.$.classname',
      'testsuite.testcase.#.failure.#.$.type',
      'testsuite.$.name',
      'testsuite.$.tests',
      'testsuite.$.skipped',
      'testsuite.$.failures',
    ],
  });
}
