import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest, playwrightVersion } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, {
    env: { NODE_OPTIONS: '--loader ts-node/esm --no-warnings' },
  });

  // on pw < 1.35 for esm-ts location is incorrect (:9:11 instead of :7:11)
  // needs investigation or eventually update minimal pw version
  if (playwrightVersion < '1.35') return;

  expect(stdout).toContain(
    `Given State 1 ${normalize('.features-gen/one/sample.feature.spec.js')}:7:11`,
  );
});
