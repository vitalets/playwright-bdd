import {
  test,
  TestDir,
  normalize,
  execPlaywrightTestWithError,
  BDDGEN_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (rejects unsupported RegExp flags)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    `Remove unsupported RegExp flags "gy" from step definition /^a step$/gy at ${normalize('features/steps.ts')}:5.`,
    { cmd: BDDGEN_CMD },
  );
});
