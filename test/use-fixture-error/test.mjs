import { test, TestDir, execPlaywrightTestWithError, DEFAULT_CMD } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(`error: useFixture with variable`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    `this.useFixture() can accept only static string as an argument`,
    `npx cross-env-shell STEPS="steps.ts" "${DEFAULT_CMD}"`,
  );
});

test(`error: useFixture with template literal`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    `this.useFixture() can accept only static string as an argument`,
    `npx cross-env-shell STEPS="steps2.ts" "${DEFAULT_CMD}"`,
  );
});
