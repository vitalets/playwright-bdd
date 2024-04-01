import { expect } from '@playwright/test';
import {
  test,
  execPlaywrightTest,
  TestDir,
  BDDGEN_CMD,
  PLAYWRIGHT_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('.features-gen');
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} -c config && ${PLAYWRIGHT_CMD} -c config`,
  );
  expect(testDir.isFileExists('.features-gen/root.feature.spec.js')).toEqual(true);
  expect(testDir.isFileExists('.features-gen/config/features/sample.feature.spec.js')).toEqual(
    true,
  );
  expect(testDir.isFileExists('.features-gen/subdir/subdir.feature.spec.js')).toEqual(true);
  expect(stdout).toContain('3 passed');
});
