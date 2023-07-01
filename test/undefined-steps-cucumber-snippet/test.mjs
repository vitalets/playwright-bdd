import test from 'node:test';
import { getTestName, execPlaywrightTestWithError } from '../helpers.mjs';

test(getTestName(import.meta), (t) =>
  execPlaywrightTestWithError(t.name, [
    `1. Missing step definition for "sample.feature:4:9"`,
    `Given('Step without parameters', async function () {`,
    `Given('Step with one string parameter {string}', async function (string) {`,
    `Missing step definitions (2)`,
  ]),
);
