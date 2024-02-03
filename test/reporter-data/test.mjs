import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

test(getTestName(import.meta), (t) => {
  const stdout = execPlaywrightTest(t.name);
  expect(stdout).toContain(
    `Given I am on home page ${normalize('.features-gen/sample.feature.spec.js')}:7:11`,
  );
  expect(stdout).toContain('page.goto(https://example.com) fixtures.ts:8:21');

  // prepended keywords
  expect(stdout).toContain(`And Action 1`);
  expect(stdout).toContain(`When Action 2`);
  expect(stdout).toContain(`And Action 3`);
  expect(stdout).toContain(`Then Action 4`);
  expect(stdout).toContain(`But Action 5`);
  expect(stdout).toContain(`And Action 6`);

  // for non-en lang keywords are not prepended
  expect(stdout).toContain(`Состояние 1`);
  expect(stdout).not.toContain(`Пусть Состояние 1`);
});
