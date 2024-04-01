import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name);
  expect(stdout).toContain(
    `WARNING: usage of requireModule: ['ts-node/register'] is not recommended`,
  );
});
