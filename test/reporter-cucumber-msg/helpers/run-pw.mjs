/**
 * Helper script to test particular CCK feature.
 * Feature dir is passed as last argument that is convenient.
 *
 * Usage:
 * node test/reporter-cucumber-msg/helpers/run-pw.mjs <featureDir>
 * node test/reporter-cucumber-msg/helpers/run-pw.mjs minimal
 */
import { execSync } from 'node:child_process';

const featureDir = process.argv[2];

execSync(`npm run only -- test/reporter-cucumber-msg`, {
  stdio: 'inherit',
  env: {
    ...process.env,
    FEATURE_DIR: featureDir,
  },
});
