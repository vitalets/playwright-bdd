import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  execPlaywrightTest(testDir.name);

  expect(
    testDir.getFileContents('.features-gen/features/scenario-simple.feature.spec.js'),
  ).toContain('import { test } from "../../steps/fixtures.ts";');

  expect(
    testDir.isFileExists('.features-gen/features/background-no-scenarios.feature.spec.js'),
  ).toEqual(false);
});
