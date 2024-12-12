import { test, TestDir, normalize, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (error in bddgen main thread)`, () => {
  execPlaywrightTestWithError(testDir.name, [
    `Tagged beforeAll hooks can use only feature-level tags`,
    `Feature: ${normalize('features/sample.feature')}`,
    `- 1 hook(s): scenario 1 @scenario1`,
    `- 0 hook(s): scenario 2`,
  ]);
});

test(`${testDir.name} (error in bddgen worker thread)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Tagged beforeAll hooks can use only feature-level tags`,
      `Feature: ${normalize('features/sample.feature')}`,
      `- 1 hook(s): scenario 1 @scenario1`,
      `- 0 hook(s): scenario 2`,
    ],
    { env: { ERROR_IN_WORKER_THREAD: 1 } },
  );
});
