/**
 * Runs Playwright for each dir in features/* and validates messages report.
 *
 * Run single feature:
 * node test/reporter-cucumber-msg/helpers/run-pw.mjs minimal
 *
 * Generate expected report by Cucumber:
 * node test/reporter-cucumber-msg/helpers/run-c.mjs minimal
 *
 * Or to debug:
 * cd test/reporter-cucumber-msg
 * FEATURE_DIR=minimal npx playwright test
 */
import fg from 'fast-glob';
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTestInternal, DEFAULT_CMD } from '../_helpers/index.mjs';
import { messageReportFields } from './message-report.fields.mjs';
import { jsonReportFields } from './json-report.fields.mjs';
import { assertShape } from './helpers/json-shape.mjs';
import { getMessagesFromFile, getJsonFromFile } from './helpers/read-file.mjs';

const onlyFeatureDir = process.env.FEATURE_DIR;
const skipDirs = [
  // For skipped scenarios Playwright does not even run fixtures.
  // We can't align here with Cucumber.
  'skipped',
];

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
 * e.g. 'minimal'
 */
async function checkFeature(featureDir) {
  const absFeatureDir = testDir.getAbsPath(`features/${featureDir}`);

  try {
    execPlaywrightTestInternal(testDir.name, { env: { FEATURE_DIR: featureDir } });
  } catch (e) {
    // some features normally exit with error
    if (e.message.trim() !== `Command failed: ${DEFAULT_CMD}`) {
      throw e;
    }
  }

  assertMessagesReport(absFeatureDir);
  assertJsonReport(absFeatureDir);

  if (featureDir === 'attachments') {
    const actualJson = getJsonFromFile(
      `${absFeatureDir}/actual-reports/json-report-no-attachments.json`,
    );
    expect(JSON.stringify(actualJson, null, 2)).not.toContain('embeddings');
  }
}

function assertMessagesReport(absFeatureDir) {
  const actualMessages = getMessagesFromFile(`${absFeatureDir}/actual-reports/messages.ndjson`);
  const expectedMessages = getMessagesFromFile(`${absFeatureDir}/expected-reports/messages.ndjson`);
  assertShape(actualMessages, expectedMessages, messageReportFields);
}

function assertJsonReport(absFeatureDir) {
  const actualJson = getJsonFromFile(`${absFeatureDir}/actual-reports/json-report.json`);
  const expectedJson = getJsonFromFile(`${absFeatureDir}/expected-reports/json-report.json`);
  assertShape(actualJson, expectedJson, jsonReportFields);
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
    .filter((dir) => !skipDirs.includes(dir));
}
