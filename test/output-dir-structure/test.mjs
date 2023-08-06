import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('.features-gen');
  execPlaywrightTest(testDir.name);
  expect(testDir.isFileExists('.features-gen/root.feature.spec.js')).toEqual(true);
  expect(testDir.isFileExists('.features-gen/abs-path.feature.spec.js')).toEqual(true);
  expect(testDir.isFileExists('.features-gen/subdir/subdir.feature.spec.js')).toEqual(true);
  expect(testDir.isFileExists('.features-gen/rel-path.feature.spec.js')).toEqual(true);
});
