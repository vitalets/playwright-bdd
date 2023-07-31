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

function showCucumberVersion() {
  const { version } = JSON.parse(
    fs.readFileSync('node_modules/@cucumber/cucumber/package.json', 'utf8'),
  );

  console.log(`Cucumber version: ${version}`);
}

function symlinkPlaywrghtBdd() {
  const playwrightBddPath = './node_modules/playwright-bdd';
  // important to use lstat to get info about symlink itself
  const stat = fs.lstatSync(playwrightBddPath, { throwIfNoEntry: false });
  if (stat?.isDirectory()) {
    fs.rmSync(playwrightBddPath, { recursive: true });
  }
  // symlink node_modules/playwright-bdd to dist
  // as generated files use: import { test } from "playwright-bdd"
  execSync(`ln -sfn ../dist ${playwrightBddPath}`, { stdio: 'inherit' });
}

function buildDist() {
  execSync('npm run build', { stdio: 'inherit' });
}
