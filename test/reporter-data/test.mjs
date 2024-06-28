import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { test, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name);
  checkStepLocations(stdout);
  checkStepTitles(stdout);
});

function checkStepLocations(stdout) {
  expect(stdout).toContain(
    `Given I am on home page ${normalize('.features-gen/features/sample.feature.spec.js')}:11:11`,
  );
  expect(stdout).toContain(`page.goto(https://example.com) ${normalize('features/pom.ts')}:11:21`);
  expect(stdout).toContain(
    `And decorator step ${normalize('.features-gen/features/sample.feature.spec.js')}:12:11`,
  );
  expect(stdout).toContain(`hook 1 ${normalize('features/steps.ts')}:14:1`);
}

function checkStepTitles(stdout) {
  // prepended keywords
  expect(stdout).toContain(`Given background step`);
  expect(stdout).toContain(`And Action 1`);
  expect(stdout).toContain(`When Action 2`);
  expect(stdout).toContain(`And Action 3`);
  expect(stdout).toContain(`Then Action 4`);
  expect(stdout).toContain(`But Action 5`);
  expect(stdout).toContain(`And Action 6`);

  // for non-en lang keywords are not prepended
  expect(stdout).toContain(`Состояние 0`);
  expect(stdout).toContain(`Состояние 1`);
  expect(stdout).not.toContain(`Пусть Состояние 1`);
}
