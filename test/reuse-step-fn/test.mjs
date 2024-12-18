import {
  test,
  TestDir,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  DEFAULT_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (pw-style, success)`, () => {
  execPlaywrightTest(testDir.name, {
    cmd: `${DEFAULT_CMD} --project pw-style`,
    env: { TAG: '@success' },
  });
});

test(`${testDir.name} (pw-style, error)`, () => {
  execPlaywrightTestWithError(testDir.name, ['Missing fixtures: todos, $testInfo'], {
    cmd: `${DEFAULT_CMD} --project pw-style`,
    env: { TAG: '@error' },
  });
});

test(`${testDir.name} (cucumber-style, success)`, () => {
  execPlaywrightTest(testDir.name, {
    cmd: `${DEFAULT_CMD} --project cucumber-style`,
    env: { TAG: '@success' },
  });
});

test(`${testDir.name} (pw-style-world, success)`, () => {
  execPlaywrightTest(testDir.name, {
    cmd: `${DEFAULT_CMD} --project pw-style-world`,
    env: { TAG: '@success' },
  });
});

test(`${testDir.name} (pw-style-world, error)`, () => {
  execPlaywrightTestWithError(testDir.name, ['Missing fixtures: $testInfo'], {
    cmd: `${DEFAULT_CMD} --project pw-style-world`,
    env: { TAG: '@error' },
  });
});
