/**
 * Setup
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

setup();

function setup() {
  !process.env.CI && ensureNodeVersion(20);
  showPlaywrightVersion();
  showCucumberVersion();
  removeTestResultsDir();
  // must build project before tests as we run tests without ts-node
  buildDist();
}

function ensureNodeVersion(version) {
  if (!process.version.startsWith(`v${version}.`)) {
    throw new Error(`Expected node version: ${version}`);
  }
}

function showPlaywrightVersion() {
  const { version } = JSON.parse(
    fs.readFileSync('node_modules/@playwright/test/package.json', 'utf8'),
  );

  console.log(`Playwright version: ${version}`);
}

function showCucumberVersion() {
  const { version } = JSON.parse(
    fs.readFileSync('node_modules/@cucumber/cucumber/package.json', 'utf8'),
  );

  console.log(`Cucumber version: ${version}`);
}

function buildDist() {
  execSync('npm run build', { stdio: 'inherit' });
}

function removeTestResultsDir() {
  const dir = './test-results';
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
