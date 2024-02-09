/**
 * Runs Playwright for each dir in features/* and validates messages report.
 * FEATURE_DIR=cck/minimal npm run only -- test/reporter-cucumber-msg
 */
import fg from 'fast-glob';
import fs from 'node:fs';
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTestInternal } from '../helpers.mjs';
import { messageReportFields, jsonReportFields } from './fields.config.mjs';
import { buildShape } from './helpers/json-shape.mjs';

const onlyFeatureDir = process.env.FEATURE_DIR;

const testDir = new TestDir(import.meta);
test(testDir.name, async () => {
  const dirs = onlyFeatureDir ? [onlyFeatureDir] : getAllFeatureDirs();
  for (const dir of dirs) {
    await checkFeature(dir);
  }
});

/**
 * Checks feature.
 * featureDir - path to feature dir inside ./features,
 * e.g. 'passed-scenario' or 'cck/minimal'
 */
async function checkFeature(featureDir) {
  const absFeatureDir = testDir.getAbsPath(`features/${featureDir}`);

  try {
    execPlaywrightTestInternal(testDir.name, { env: { FEATURE_DIR: featureDir } });
  } catch (e) {
    // some features exit with error
  }

  const expectedMessages = getMessagesFromFile(`${absFeatureDir}/expected/messages.ndjson`);
  const actualMessages = getMessagesFromFile(`${absFeatureDir}/reports/messages.ndjson`);
  assertShape(expectedMessages, actualMessages, messageReportFields, featureDir);

  const expectedJson = getJsonFromFile(`${absFeatureDir}/expected/json-report.json`);
  const actualJson = getJsonFromFile(`${absFeatureDir}/reports/json-report.json`);
  assertShape(expectedJson, actualJson, jsonReportFields, featureDir);
}

/**
 * Returns all feature dirs.
 */
function getAllFeatureDirs() {
  return fg
    .sync('**', {
      cwd: testDir.getAbsPath('features'),
      deep: 1,
      onlyDirectories: true,
    })
    .filter((dir) => !dir.startsWith('_'));
}

/**
 * Compares shapes of two objects/arrays.
 */
export function assertShape(expected, actual, fieldsConfig, featureDir) {
  const expectedShape = buildShape(expected, fieldsConfig);
  const actualShape = buildShape(actual, fieldsConfig);
  expect(actualShape, featureDir).toStrictEqual(expectedShape);
}

/**
 * Reads messages from ndjson file and returns as array.
 */
function getMessagesFromFile(file) {
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function getJsonFromFile(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
