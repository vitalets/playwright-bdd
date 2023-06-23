import fs from 'node:fs';
import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';

export function execPlaywrightTest(dir, opts = { stdio: 'inherit' }) {
  const loader = dir === 'esm-ts' ? '--loader ts-node/esm' : '';
  try {
    execSync(`node ${loader} ../../dist/gen/cli && npx playwright test`, {
      cwd: path.join(`test`, dir),
      ...opts,
    });
  } catch (e) {
    if (opts.stdio === 'inherit') {
      // error already printed
      process.exit(1);
    } else {
      throw e;
    }
  }
}

export function execPlaywrightTestWithError(dir, regexp) {
  assert.throws(
    () => execPlaywrightTest(dir, { stdio: 'pipe' }),
    (e) => {
      assert.equal(e.status, 1);
      assert.match(e.stdout.toString(), regexp);
      return true;
    },
  );
}

export function showPlaywrightVersion() {
  const { version } = JSON.parse(
    fs.readFileSync('node_modules/@playwright/test/package.json', 'utf8'),
  );

  console.log(`Playwright version: ${version}`);
}

export function symlinkPlaywrghtBdd() {
  // symlink node_modules/playwright-bdd to dist
  // as generated files import { test } from "playwright-bdd"
  execSync('ln -sfn ../dist ./node_modules/playwright-bdd', { stdio: 'inherit' });
}

export function buildDist() {
  execSync('npm run build', { stdio: 'inherit' });
}

export function defineTestOnly(test) {
  test.only = (title, fn) => {
    if (process.env.FORBID_ONLY) throw new Error(`test.only is forbidden`);
    test(title, { only: true }, fn);
  };
}
