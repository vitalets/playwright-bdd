/**
 * Setup
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

setup();

function setup() {
  !process.env.CI && ensureNodeVersion(20);

  showPlaywrightVersion();

  // link node_modules/playwright-bdd to dist
  // as generated files import { test } from "playwright-bdd"
  symlinkPlaywrghtBdd();

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

function symlinkPlaywrghtBdd() {
  const playwrightBddPath = './node_modules/playwright-bdd';
  fs.rmdirSync(playwrightBddPath, { recursive: true, force: true });
  // symlink node_modules/playwright-bdd to dist
  // as generated files import { test } from "playwright-bdd"
  execSync(`ln -sfn ../dist ${playwrightBddPath}`, { stdio: 'inherit' });
}

function buildDist() {
  execSync('npm run build', { stdio: 'inherit' });
}
