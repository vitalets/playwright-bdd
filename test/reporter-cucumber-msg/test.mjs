/**
 * Runs Playwright for each dir in features/* and validates messages report.
 *
 * Run single feature:
 * node test/reporter-cucumber-msg/run/run-pw.mjs minimal
 *
 * Generate expected report by Cucumber:
 * node test/reporter-cucumber-msg/run/run-c.mjs minimal
 *
 * Or to debug:
 * cd test/reporter-cucumber-msg
 * FEATURE_DIR=minimal npx playwright test
 */
import fg from 'fast-glob';
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTestInternal, DEFAULT_CMD } from '../_helpers/index.mjs';
import { getJsonFromFile } from '../_helpers/reports/json.mjs';

const onlyFeatureDir = process.env.FEATURE_DIR;
const skipDirs = [
  // For skipped scenarios Playwright does not even run fixtures.
  // We can't align here with Cucumber.
  'skipped',
];

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  const dirs = onlyFeatureDir ? [onlyFeatureDir] : readAllFeatureDirs();
  for (const dir of dirs) {
    await checkFeature(dir);
  }
});

/**
 * Checks feature.
 * featureDir - name of feature dir inside ./features,
 * e.g. 'minimal'
 */
async function checkFeature(featureDir) {
  try {
    execPlaywrightTestInternal(testDir.name, { env: { FEATURE_DIR: featureDir } });
  } catch (e) {
    // some features normally exit with error
    if (e.message.trim() !== `Command failed: ${DEFAULT_CMD}`) {
      throw e;
    }
  }

  assertMessagesReport(featureDir);
  assertJsonReport(featureDir);
  assertJsonReportNoAttachments(featureDir);
}

function assertMessagesReport(featureDir) {
  testDir.assertMessagesReport(
    `features/${featureDir}/actual-reports/messages.ndjson`,
    `features/${featureDir}/expected-reports/messages.ndjson`,
    {
      // cucumber-js still generates messages report without these fields,
      // although they are added to @cucumber/messages
      'testRunStarted.id': null,
      'testRunFinished.testRunStartedId': null,
    },
  );
}

function assertJsonReport(featureDir) {
  testDir.assertJsonReport(
    `features/${featureDir}/actual-reports/json-report.json`,
    `features/${featureDir}/expected-reports/json-report.json`,
  );
}

function assertJsonReportNoAttachments(featureDir) {
  if (featureDir === 'attachments') {
    const reportAbsPath = testDir.getAbsPath(
      `features/${featureDir}/actual-reports/json-report-no-attachments.json`,
    );
    const actualJson = getJsonFromFile(reportAbsPath);
    expect(JSON.stringify(actualJson, null, 2)).not.toContain('embeddings');
  }
}

/**
 * Returns all feature dirs.
 */
function readAllFeatureDirs() {
  return fg
    .sync('**', {
      cwd: testDir.getAbsPath('features'),
      deep: 1,
      onlyDirectories: true,
    })
    .filter((dir) => !skipDirs.includes(dir));
}
