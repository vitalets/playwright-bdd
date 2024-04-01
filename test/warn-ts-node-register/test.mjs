import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest } from '../_helpers/index.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(t.name);
  expect(stdout).toContain(
    `WARNING: usage of requireModule: ['ts-node/register'] is not recommended`,
  );
});
