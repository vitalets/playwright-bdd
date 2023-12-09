import { test, TestDir, execPlaywrightTestWithError } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(`error: useFixture with variable`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    `this.useFixture() can accept only static string as an argument`,
    {
      env: { STEPS: 'steps.ts' },
    },
  );
});

test(`error: useFixture with template literal`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    `this.useFixture() can accept only static string as an argument`,
    {
      env: { STEPS: 'steps2.ts' },
    },
  );
});
