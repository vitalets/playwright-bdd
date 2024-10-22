import {
  test,
  TestDir,
  normalize,
  execPlaywrightTest,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (success)`, () => {
  execPlaywrightTest(testDir.name, { env: { PROJECT: 'success' } });
});

test(`${testDir.name} (fail)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Multiple step definitions found`, // prettier-ignore
      `Step: Given duplicate step 1`,
      `File: ${normalize('features/fail/sample.feature:4:5')}`,
      `Given 'duplicate step 1' # ${normalize('features/fail/steps.ts:5')}`,
      `Given 'duplicate step {int}' # ${normalize('features/fail/steps.ts:6')}`,
    ],
    { env: { PROJECT: 'fail' } },
  );
});
