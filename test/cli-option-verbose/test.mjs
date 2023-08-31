import { expect } from '@playwright/test';
import { test, execPlaywrightTest, TestDir } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, 'node ../../dist/cli --verbose');
  expect(stdout).toContain('Loading features from: features/*.feature');
  expect(stdout).toContain('Loading steps from: steps.ts');
  expect(stdout).toContain('Generated: .features-gen/features/sample.feature.spec.js');
  expect(stdout).toContain('Generated files: 1');
});
