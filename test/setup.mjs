/**
 * Test setup
 */
import { execSync } from 'node:child_process';
import { getPackageVersion } from './_helpers/index.mjs';

const logger = console;

setup();

function setup() {
  if (!process.env.CI) ensureNodeVersion(20);
  showVersion('@playwright/test');
  showVersion('@playwright/experimental-ct-react');
  // must build project before tests as we run tests without ts-node
  execSync('npm run build', { stdio: 'inherit' });
}

function showVersion(pkg) {
  logger.log(`Version of ${pkg}: ${getPackageVersion(pkg) || 'none'}`);
}

function ensureNodeVersion(version) {
  if (!process.version.startsWith(`v${version}.`)) {
    throw new Error(`Expected node version: ${version}`);
  }
}
