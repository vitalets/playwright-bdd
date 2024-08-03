import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  DEFAULT_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (pw-style-success)`, () => {
  execPlaywrightTest(testDir.name, `${DEFAULT_CMD} --project pw-style-success`);
});

test(`${testDir.name} (cucumber-style-success)`, () => {
  execPlaywrightTest(testDir.name, `${DEFAULT_CMD} --project cucumber-style-success`);
});

test(`${testDir.name} (pw-style-invalid-invocation)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    ['Missing fixtures: todos, $testInfo'],
    `${DEFAULT_CMD} --project pw-style-invalid-invocation`,
  );
});
