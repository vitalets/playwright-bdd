/**
 * Assertion of Cucumber junit reports.
 */
import fs from 'node:fs';
import xml2js from 'xml2js';
import { assertJsonPaths } from './helpers.mjs';

export async function assertJunitReport(actualFile, expectedFile) {
  const actualJson = await getJsonFromXmlFile(actualFile);
  const expectedJson = await getJsonFromXmlFile(expectedFile);
  assertJsonPaths(actualJson, expectedJson, rules);
}

async function getJsonFromXmlFile(file) {
  const xml = fs.readFileSync(file, 'utf8');
  return xml2js.parseStringPromise(xml);
}

const rules = {
  'testsuite.testcase.#.$.name': 'value',
  'testsuite.testcase.#.$.classname': 'value',
  'testsuite.testcase.#.failure.#.$.type': 'value',
  'testsuite.$.name': 'value',
  'testsuite.$.tests': 'value',
  'testsuite.$.skipped': 'value',
  'testsuite.$.failures': 'value',
};
