/**
 * Helper script to generate expected messages via real Cucumber
 * for the particular feature dir.
 * Feature dir is passed as a last argument that is convenient.
 *
 * Usage:
 * node test/reporter-cucumber-msg/run/run-c.mjs <featureDir>
 * node test/reporter-cucumber-msg/run/run-c.mjs minimal
 * node test/reporter-cucumber-msg/run/run-c.mjs all
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const featureDir = process.argv[2];

if (featureDir === 'all') {
  for (const dir of readAllFeatureDirs()) {
    generateGoldenMessagesReport(dir);
  }
} else if (featureDir) {
  generateGoldenMessagesReport(featureDir);
} else {
  throw new Error(`Empty <featureDir>`);
}

function generateGoldenMessagesReport(featureDir) {
  try {
    // eslint-disable-next-line no-console
    console.log(`Generating: features/${featureDir}/expected-reports/messages.ndjson`);
    execSync(`npx cucumber-js -c cucumber.config.js`, {
      stdio: 'inherit',
      cwd: 'test/reporter-cucumber-msg',
      env: {
        ...process.env,
        FEATURE_DIR: featureDir,
      },
    });
  } catch {
    // error is also expected
  }
}

/**
 * Returns all feature dirs.
 */
function readAllFeatureDirs() {
  return fs
    .readdirSync('test/reporter-cucumber-msg/features', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}
