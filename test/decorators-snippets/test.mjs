import { test, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () =>
  execPlaywrightTestWithError(testDir.name, [
    `Missing step definitions: 2`,
    `@When('I add todo {string}'); // From: sample.feature:5:5`,
    `@Then('visible todos count is {int}'); // From: sample.feature:7:5`,
  ]),
);
