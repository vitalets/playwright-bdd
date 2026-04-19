/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from '@playwright/test';
import { BeforeStep } from './fixtures';

// Order of calls is important here!

// runs before each step
BeforeStep(async ({ log, testFixtureCommon, $testInfo }) => {
  log(`BeforeStep 1`);
  await $testInfo.attach('BeforeStep 1 attachment', { body: 'some text' });
});

// runs before steps of scenario with tag: @error-in-before-step-hook
BeforeStep({ tags: '@error-in-before-step-hook' }, async ({ log }) => {
  log(`BeforeStep with error`);
  expect(1).toBe(2);
});

// runs before each step
BeforeStep({ name: 'named BeforeStep' }, async ({ log }) => {
  log(`BeforeStep 2`);
});

// runs before steps of scenario with tag: @scenario2
BeforeStep({ tags: '@scenario2' }, async ({ log, testFixtureScenario2 }) => {
  log(`BeforeStep 3 (@scenario2)`);
});
