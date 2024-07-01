import { test, expect, TestDir, BDDGEN_CMD, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

const warning = 'Option "importTestFrom" in defineBddConfig() is not needed anymore';

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, { cmd: BDDGEN_CMD });
  expect(stdout).toContain(warning);
});

test(`${testDir.name} (disabled warning)`, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    cmd: BDDGEN_CMD,
    env: { DISABLE_WARNING: '1' },
  });
  expect(stdout).not.toContain(warning);
});
