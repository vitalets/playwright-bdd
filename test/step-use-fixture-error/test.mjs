import { test, TestDir, execPlaywrightTestWithError, DEFAULT_CMD } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (variable)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    `this.useFixture() can accept only static string as an argument`,
    `${DEFAULT_CMD} --project=variable`,
  );
});

test(`${testDir.name} (template-literal)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    `this.useFixture() can accept only static string as an argument`,
    `${DEFAULT_CMD} --project=template-literal`,
  );
});
