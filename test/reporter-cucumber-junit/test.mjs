/**
 * To re-write expected.json with golden data, run the following:
 * GOLDEN=1 npm run only -- test/reporter-cucumber-junit
 */
import fs from 'node:fs';
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTestWithError } from '../helpers.mjs';
import xml2js from 'xml2js';
import { buildObjectShape } from '../reporter-cucumber-msg/helpers/shared.mjs';

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
  const expectedShapeFile = testDir.getAbsPath('expected.json');
  const actualReportFile = testDir.getAbsPath('reports/report.xml');
  const xml = fs.readFileSync(actualReportFile, 'utf8');
  const json = await xml2js.parseStringPromise(xml);
  const actualShape = buildObjectShape(json, { ignorePaths, valuePaths });
  if (process.env.GOLDEN) {
    const content = JSON.stringify(actualShape, null, 2);
    fs.writeFileSync(expectedShapeFile, content);
    console.log(`Created: ${expectedShapeFile}`);
  } else {
    const expectedShape = JSON.parse(fs.readFileSync(expectedShapeFile, 'utf8'));
    expect(actualShape).toStrictEqual(expectedShape);
  }
}

function copyFeatures() {
  fs.cpSync('test/reporter-cucumber-html/features', testDir.getAbsPath('features'), {
    recursive: true,
  });
}
