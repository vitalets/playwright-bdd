import { test, TestDir, normalize, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (not-same-worker-hooks)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Error: Tagged beforeAll hooks should be the same for all scenarios in a feature`,
      `Feature: ${normalize('not-same-worker-hooks/sample.feature')}`,
      `- 1 hook(s): scenario 1 @scenario1`,
      `- 0 hook(s): scenario 2`,
    ],
    {
      env: { FEATURES_ROOT: 'not-same-worker-hooks' },
    },
  );
});
