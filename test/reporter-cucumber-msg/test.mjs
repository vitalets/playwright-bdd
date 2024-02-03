/**
 * Runs Playwright for each dir in features/* and validates messages report.
 * Expected reports are taken from 2 places:
 * 1. Cucumber tests
 * - https://github.com/cucumber/cucumber-js/tree/main/features/fixtures/formatters
 * 2. Cucumber compatibility tests (CCK)
 * - https://github.com/cucumber/compatibility-kit
 * - for step definitions better to check Cucumber CCK suite:
 *   https://github.com/cucumber/cucumber-js/tree/main/compatibility/features
 *
 * Run single feature:
 * npm run only -- test/reporter-cucumber passed-scenario
 * npm run only -- test/reporter-cucumber cck/minimal
 */
import path from 'node:path';
import fg from 'fast-glob';
import { assertMessageReport } from './helpers/assertMessageReport.mjs';
import { assertJsonReport } from './helpers/assertJsonReport.mjs';

import { test, TestDir, execPlaywrightTest } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

const onlyFeatureDir = process.argv[2];

const skipFeatureDirs = [
  // skip b/c extra steps for hooks
  'cck/attachments',
];

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
  const featureName = featureDir.split(path.sep).pop();
  const isCCK = featureDir.startsWith('cck');

  execPlaywrightTest(testDir.name, { env: { FEATURE_DIR: featureDir } });

  const expectedFile = isCCK
    ? `${absFeatureDir}/${featureName}.feature.ndjson`
    : `${absFeatureDir}/${featureName}.message.json.js`;

  await assertMessageReport({
    expectedFile,
    actualFile: `${absFeatureDir}/report.ndjson`,
    isCCK,
  });

  if (!isCCK) {
    await assertJsonReport({
      expectedFile: `${absFeatureDir}/${featureName}.json.js`,
      actualFile: `${absFeatureDir}/report.json`,
      isCCK,
    });
  }
}

/**
 * Returns all feature dirs.
 */
function getAllFeatureDirs() {
  return fg
    .sync('**', {
      cwd: testDir.getAbsPath('features'),
      deep: 2,
      onlyDirectories: true,
    })
    .filter((dir) => dir !== 'cck' && !skipFeatureDirs.includes(dir));
}
