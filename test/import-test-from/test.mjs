import {
  test,
  TestDir,
  normalize,
  BDDGEN_CMD,
  execPlaywrightTestWithError,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (ambiguos-test-instance)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Can't guess test instance for: ${normalize('ambiguos-test-instance/sample.feature')}`,
      `Found 2 test instances`,
    ],
    {
      cmd: BDDGEN_CMD,
      env: { PROJECT: 'ambiguos-test-instance' },
    },
  );
});

test(`${testDir.name} (missing-test-instance)`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      `Can't guess test instance for: ${normalize('missing-test-instance/sample.feature')}`,
      `Did you include fixtures file`,
    ],
    {
      cmd: BDDGEN_CMD,
      env: { PROJECT: 'missing-test-instance' },
    },
  );
});
