import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () =>
  execPlaywrightTestWithError(testDir.name, [
    `1. Missing step definition for "sample.feature:4:5"`,
    `Given('Step without parameters', async function () {`,
    `Given('Step with one string parameter {string}', async function (arg: string) {`,
    `Missing step definitions: 2`,
  ]),
);
