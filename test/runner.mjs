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
test('esm-ts', (t) =>
  // for esm-ts use 'npm test' cmd to show how test script should look in package.json
  execPlaywrightTest(t.name, {}, 'npm test'));
test('snapshots', (t) => execPlaywrightTest(t.name));

test('several-projects-no-outputdir', (t) => {
  execPlaywrightTestWithError(t.name, `please manually provide different "outputDir" option`);
});

test('parse-error', (t) => {
  execPlaywrightTestWithError(t.name, `Parse error in "sample\.feature" (1:1)`);
});

test('error-import-test-from-steps', (t) => {
  execPlaywrightTestWithError(t.name, `Option "importTestFrom" should point to separate file`);
});

test('error-import-test-not-from-bdd', (t) => {
  execPlaywrightTestWithError(t.name, `createBdd() should use test extended from "playwright-bdd"`);
});

test('no-import-test-from', (t) => {
  execPlaywrightTestWithError(
    t.name,
    `When using custom "test" function in createBdd() you should`,
  );
});

test('undefined-steps-cucumber-snippet', (t) => {
  execPlaywrightTestWithError(t.name, [
    `1. Missing step definition for "sample.feature:4:9"`,
    `Given('Step without parameters', async function () {`,
    `Given('Step with one string parameter {string}', async function (string) {`,
    `Missing step definitions (2)`,
  ]);
});

test('undefined-steps-playwright-snippet', (t) => {
  execPlaywrightTestWithError(t.name, [
    `1. Missing step definition for "sample.feature:4:9"`,
    `Given('Step without parameters', async ({}) => {`,
    `Given('Step with one string parameter {string}', async ({}, arg: string) => {`,
    `Given('Step with two string parameters {string} and {string}', async ({}, arg: string, arg1: string) => {`,
    `Given('Step with one float parameter {float}', async ({}, arg: number) => {`,
    `Given('Step with one int parameter {int}', async ({}, arg: number) => {`,
    `Given('Step with two int parameters {int} and {int}', async ({}, arg: number, arg1: number) => {`,
    `Given('Step with docString', async ({}, docString: string) => {`,
    `Given('Step with dataTable', async ({}, dataTable: DataTable) => {`,
    `When('I click link {string}', async ({}, arg: string) => {`,
    `Then('I see in title {string}', async ({}, arg: string) => {`,
    `Missing step definitions (10)`,
  ]);
});

test('no-define-bdd-config', (t) => {
  execPlaywrightTestWithError(t.name, `No BDD configs found`);
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
