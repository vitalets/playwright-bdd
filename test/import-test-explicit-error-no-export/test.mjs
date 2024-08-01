import { test, TestDir, execPlaywrightTestWithError, BDDGEN_CMD } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name} (no-extension-js)`, () => {
  execPlaywrightTestWithError(testDir.name, getError('steps-js/fixtures.js'), {
    cmd: BDDGEN_CMD,
    env: { TEST_NAME: 'no-extension-js' },
  });
});

test(`${testDir.name} (no-extension-ts)`, () => {
  execPlaywrightTestWithError(testDir.name, getError('steps-ts/fixtures.ts'), {
    cmd: BDDGEN_CMD,
    env: { TEST_NAME: 'no-extension-ts' },
  });
});

test(`${testDir.name} (with-extension-ts)`, () => {
  execPlaywrightTestWithError(testDir.name, getError('steps-ts/fixtures.ts'), {
    cmd: BDDGEN_CMD,
    env: { TEST_NAME: 'with-extension-ts' },
  });
});

function getError(importTestFile) {
  return `File "${importTestFile}" pointed by "importTestFrom" should export "test" variable`;
}
