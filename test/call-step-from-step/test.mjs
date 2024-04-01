import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  DEFAULT_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (success)`, () => {
  execPlaywrightTest(testDir.name, `${DEFAULT_CMD} --project success`);
});

test(`${testDir.name} (invalid invocation)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    ['Missings fixtures: todos, $testInfo'],
    `${DEFAULT_CMD} --project fail`,
  );
});
