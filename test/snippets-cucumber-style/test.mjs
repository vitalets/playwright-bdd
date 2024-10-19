import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () =>
  execPlaywrightTestWithError(testDir.name, [
    `Missing step definitions: 2`,
    `Given('Step without parameters', async function () {`,
    `// Step: Given Step without parameters`,
    `// From: sample.feature:4:5`,
    `Given('Step with one string parameter {string}', async function (arg: string) {`,
  ]),
);
