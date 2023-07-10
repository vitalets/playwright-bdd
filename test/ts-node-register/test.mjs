import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(t.name, { stdio: 'pipe' });
  expect(stdout).toContain(
    `WARNING: usage of requireModule: ['ts-node/register'] is not recommended`,
  );
});
