/**
 * Helper script to generate expected messages via real Cucumber
 * for the particular feature dir.
 * Feature dir is passed as a last argument that is convenient.
 *
 * Usage:
 * node test/reporter-cucumber-msg/helpers/run-c.mjs <featureDir>
 * node test/reporter-cucumber-msg/helpers/run-c.mjs minimal
 */
import { execSync } from 'node:child_process';

const featureDir = process.argv[2];
if (!featureDir) throw new Error(`Empty <featureDir>`);

// eslint-disable-next-line no-console
console.log(`Generating: features/${featureDir}/expected-reports/messages.ndjson`);

try {
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
