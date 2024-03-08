/**
 * Test of Cucumber junit report.
 *
 * Command to re-write expected shape with actual:
 * cp test/reporter-cucumber-junit/reports/actualShape.json test/reporter-cucumber-junit/expectedShape.json
 */
import fs from 'node:fs';
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTestWithError } from '../helpers.mjs';
import xml2js from 'xml2js';
import { buildShape } from '../reporter-cucumber-msg/helpers/json-shape.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('reports');

  copyFeatures(); // re-use features from reporter-cucumber-html
  execPlaywrightTestWithError(testDir.name);

  await checkJunitReport();
});

const ignorePaths = [];
const valuePaths = [
  'testsuite.$.failures', // prettier-ignore
  'testsuite.$.skipped',
  'testsuite.$.name',
  'testsuite.$.tests',
  'testsuite.testcase.#.$.name',
];

async function checkJunitReport() {
  const actualReportFile = testDir.getAbsPath('reports/report.xml');
  const actualShapeFile = testDir.getAbsPath('reports/actualShape.json');
  const expectedShapeFile = testDir.getAbsPath('expectedShape.json');
  const xml = fs.readFileSync(actualReportFile, 'utf8');
  const json = await xml2js.parseStringPromise(xml);
  const actualShape = buildShape(json, { ignorePaths, valuePaths });
  fs.writeFileSync(actualShapeFile, JSON.stringify(actualShape, null, 2));
  const expectedShape = JSON.parse(fs.readFileSync(expectedShapeFile, 'utf8'));
  expect(actualShape).toStrictEqual(expectedShape);
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
