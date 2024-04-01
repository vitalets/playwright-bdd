import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('.features-gen');
  execPlaywrightTest(testDir.name);
  expect(testDir.isFileExists('.features-gen/features/root.feature.spec.js')).toEqual(true);
  expect(testDir.isFileExists('.features-gen/features/abs-path.feature.spec.js')).toEqual(true);
  expect(testDir.isFileExists('.features-gen/features/subdir/subdir.feature.spec.js')).toEqual(
    true,
  );
  expect(testDir.isFileExists('.features-gen/features/rel-path.feature.spec.js')).toEqual(true);
});
