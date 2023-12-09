/**
 * Setup
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { getPackageVersion } from './helpers.mjs';

setup();

function setup() {
  !process.env.CI && ensureNodeVersion(20);
  console.log(`Playwright version: ${getPackageVersion('@playwright/test')}`);
  console.log(`Cucumber version: ${getPackageVersion('@cucumber/cucumber')}`);
  removeTestResultsDir();
  // must build project before tests as we run tests without ts-node
  execSync('npm run build', { stdio: 'inherit' });
}

function ensureNodeVersion(version) {
  if (!process.version.startsWith(`v${version}.`)) {
    throw new Error(`Expected node version: ${version}`);
  }
}

function removeTestResultsDir() {
  const dir = './test-results';
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
