/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from '@playwright/test';
import { BeforeStep, AfterStep } from './fixtures';

BeforeStep(async ({ log, testFixtureCommon, $testInfo }) => {
  log(`BeforeStep 1`);
  await $testInfo.attach('BeforeStep 1 attachment', { body: 'some text' });
});

BeforeStep({ tags: '@error-in-before-step-hook' }, async ({ log }) => {
  log(`BeforeStep with error`);
  expect(1).toBe(2);
});

BeforeStep({ name: 'named BeforeStep' }, async ({ log }) => {
  log(`BeforeStep 2`);
});

BeforeStep({ tags: '@scenario2' }, async ({ log, testFixtureScenario2 }) => {
  log(`BeforeStep 3 (@scenario2)`);
});

AfterStep(async ({ log, testFixtureCommon, $testInfo }) => {
  log(`AfterStep 1`);
  await $testInfo.attach('AfterStep 1 attachment', { body: 'another text' });
});

AfterStep({ tags: '@error-in-after-step-hook' }, async ({ log }) => {
  log(`AfterStep with error`);
  expect(1).toBe(2);
});

AfterStep({ name: 'named AfterStep' }, async ({ log }) => {
  log(`AfterStep 2`);
});

AfterStep({ tags: '@scenario2' }, async ({ log, testFixtureScenario2 }) => {
  log(`AfterStep 3 (@scenario2)`);
});
