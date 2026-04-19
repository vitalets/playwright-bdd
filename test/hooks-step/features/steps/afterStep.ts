/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from '@playwright/test';
import { AfterStep } from './fixtures';

// Order of calls is important here!

// runs after each step
AfterStep(async ({ log, testFixtureCommon, $testInfo }) => {
  log(`AfterStep 1`);
  await $testInfo.attach('AfterStep 1 attachment', { body: 'another text' });
});

// runs after steps of scenario with tag: @error-in-after-step-hook
AfterStep({ tags: '@error-in-after-step-hook' }, async ({ log }) => {
  log(`AfterStep with error`);
  expect(1).toBe(2);
});

// runs after each step
AfterStep({ name: 'named AfterStep' }, async ({ log, $testInfo }) => {
  log(`AfterStep 2`);
});

// runs after steps of scenario with tag: @scenario2
AfterStep({ tags: '@scenario2' }, async ({ log, testFixtureScenario2 }) => {
  log(`AfterStep 3 (@scenario2)`);
});
