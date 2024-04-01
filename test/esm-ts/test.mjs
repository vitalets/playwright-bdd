import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest, getPackageVersion } from '../_helpers/index.mjs';

// Skip on CI for Win as it fails with error:
// TypeError: Invalid module "..\\..\\steps\\fixtures.js" is not a valid package name
// todo: investigate
const skip = process.env.CI && process.platform === 'win32';

test(getTestName(import.meta), { skip }, (t) => {
  const stdout = execPlaywrightTest(t.name, {
    env: { NODE_OPTIONS: '--loader ts-node/esm --no-warnings' },
  });

  // on pw < 1.35 for esm-ts location is incorrect (:9:11 instead of :7:11)
  // needs investigation or eventually update minimal pw version
  if (getPackageVersion('@playwright/test') < '1.35') return;

  expect(stdout).toContain(
    `Given State 1 ${normalize('.features-gen/one/sample.feature.spec.js')}:7:11`,
  );
});
