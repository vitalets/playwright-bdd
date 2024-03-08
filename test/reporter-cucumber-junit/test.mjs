/**
 * Test of Cucumber junit report.
 *
 * Command to re-write expected shape with actual:
 * cp test/reporter-cucumber-junit/reports/actualShape.json test/reporter-cucumber-junit/expectedShape.json
 */
import fs from 'node:fs';
import { test, TestDir, execPlaywrightTestWithError, getJsonFromXmlFile } from '../helpers.mjs';
import { assertShape } from '../reporter-cucumber-msg/helpers/json-shape.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('reports');

  copyFeatures(); // re-use features from reporter-cucumber-html
  execPlaywrightTestWithError(testDir.name);

  await assertJunitReport();
});

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

function copyFeatures() {
  fs.cpSync('test/reporter-cucumber-html/features', testDir.getAbsPath('features'), {
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
