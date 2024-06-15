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
  testDir.clearDir('subdir/.features-gen');
  const stdout = execPlaywrightTest(
    testDir.name,
    `${BDDGEN_CMD} -c subdir && ${PLAYWRIGHT_CMD} -c subdir`,
  );
  expect(stdout).toContain('1 passed');
  testDir.expectFileExists('subdir/.features-gen/sample.feature.spec.js');
  testDir.expectFileNotEmpty('subdir/actual-reports/report.html');
});
