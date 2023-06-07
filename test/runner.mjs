/**
 * Use js (not ts) to keep clear run via node insteadof ts-node.
 * node scripts/test
 */
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';

test.only = (title, fn) => test(title, { only: true }, fn);

// link node_modules/playwright-bdd to dist
// as generated files import { test } from "playwright-bdd"
execSync('ln -sfn ../dist ./node_modules/playwright-bdd', { stdio: 'inherit' });

// must build project before tests as we run exec('bddgen') without ts-node
execSync('npm run build', { stdio: 'inherit' });

test('bdd-syntax', (t) => execPlaywrightTest(t.name));
test('bdd-syntax-cucumber-style', (t) => execPlaywrightTest(t.name));
test('i18n', (t) => execPlaywrightTest(t.name));
test('default-world', (t) => execPlaywrightTest(t.name));
test('custom-world', (t) => execPlaywrightTest(t.name));
test('custom-fixtures', (t) => execPlaywrightTest(t.name));
test('no-fixtures', (t) => execPlaywrightTest(t.name));
test('cucumber-config-file', (t) => execPlaywrightTest(t.name));
test('several-projects', (t) => execPlaywrightTest(t.name));
test('esm', (t) => execPlaywrightTest(t.name));
test('esm-ts', (t) => execPlaywrightTest(t.name));

test('several-projects-no-outputdir', (t) => {
  execPlaywrightTestWithError(t.name, /please manually provide different "outputDir" option/);
});

test('parse-error', (t) => {
  execPlaywrightTestWithError(t.name, /Parse error in "sample\.feature" \(1:1\)/);
});

test('error-import-test-from-steps', (t) => {
  execPlaywrightTestWithError(t.name, /Option "importTestFrom" should point to separate file/);
});

test('error-import-test-not-from-bdd', (t) => {
  execPlaywrightTestWithError(
    t.name,
    /createBDD\(\) should use test extended from "playwright-bdd"/,
  );
});

test('error-missing-import-test-from', (t) => {
  execPlaywrightTestWithError(
    t.name,
    /When using custom "test" function in createBDD\(\) you should/,
  );
});

test('undefined-step', (t) => {
  execPlaywrightTestWithError(t.name, /Unknown step: I open url "https:\/\/playwright\.dev"/);
});

function execPlaywrightTest(dir, opts = { stdio: 'inherit' }) {
  execSync('npx playwright test', {
    cwd: path.join(`test`, dir),
    ...opts,
  });
}

function execPlaywrightTestWithError(dir, regexp) {
  assert.throws(
    () => execPlaywrightTest(dir, { stdio: 'pipe' }),
    (e) => {
      assert.equal(e.status, 1);
      assert.match(e.stdout.toString(), regexp);
      return true;
    },
  );
}
