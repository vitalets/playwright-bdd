/**
 * Use js (not ts) to keep clear run via node insteadof ts-node.
 * node scripts/test
 */
import test from 'node:test';

import {
  defineTestOnly,
  showPlaywrightVersion,
  symlinkPlaywrghtBdd,
  buildDist,
  execPlaywrightTest,
  execPlaywrightTestWithError,
} from './helpers.mjs';

beforeHook();

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
test('snapshots', (t) => execPlaywrightTest(t.name));

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
    /createBdd\(\) should use test extended from "playwright-bdd"/,
  );
});

test('error-missing-import-test-from', (t) => {
  execPlaywrightTestWithError(
    t.name,
    /When using custom "test" function in createBdd\(\) you should/,
  );
});

test('undefined-step', (t) => {
  execPlaywrightTestWithError(
    t.name,
    /Undefined step: I open url "https:\/\/playwright\.dev" \(sample\.feature\)/,
  );
});

test('no-steps', (t) => {
  execPlaywrightTestWithError(t.name, /No step definitions loaded. Scanned files \(1\)/);
});

test('no-define-bdd-config', (t) => {
  execPlaywrightTestWithError(t.name, /No BDD configs found/);
});

function beforeHook() {
  defineTestOnly(test);

  showPlaywrightVersion();

  // link node_modules/playwright-bdd to dist
  // as generated files import { test } from "playwright-bdd"
  symlinkPlaywrghtBdd();

  // must build project before tests as we run tests without ts-node
  buildDist();
}
