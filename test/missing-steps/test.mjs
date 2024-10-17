import { test, normalize, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (fail-on-gen)`, () => {
  execPlaywrightTestWithError(testDir.name, [`Some steps are without definition`]);
});

test(`${testDir.name} (fail-on-run)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Error: Missing step: Given missing step 1 (${normalize('features/sample.feature:4:5')})`,
      `Error: Missing step: And missing step 2 (${normalize('features/sample.feature:8:5')})`,
    ],
    {
      env: { MISSING_STEPS: 'fail-on-run' },
    },
  );
});
