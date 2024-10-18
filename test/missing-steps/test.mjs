import {
  test,
  expect,
  TestDir,
  execPlaywrightTestWithError,
  execPlaywrightTest,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (fail-on-gen)`, () => {
  execPlaywrightTestWithError(testDir.name, [
    `Missing step definitions: 1`, // prettier-ignore
    `Given('missing step {int}', async ({}, arg: number) => {`,
  ]);
});

test(`${testDir.name} (fail-on-run)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Error: Missing step: missing step 10`, // prettier-ignore
      `Error: Missing step: missing step 20`,
      `Error: Missing step: missing step 30`,
    ],
    { env: { MISSING_STEPS: 'fail-on-run' } },
  );
});

test(`${testDir.name} (skip-scenario)`, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    env: { MISSING_STEPS: 'skip-scenario' },
  });
  expect(stdout).toContain(`4 skipped`);
  expect(stdout).toContain(`1 passed`);
});
