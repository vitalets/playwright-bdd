/* eslint-disable @typescript-eslint/no-unused-vars */
import { BeforeStep, AfterStep } from './fixtures';

BeforeStep(async ({ log, testFixtureCommon }) => {
  log(`BeforeStep 1`);
});

BeforeStep(async ({ log }) => {
  log(`BeforeStep 2`);
});

BeforeStep({ tags: '@scenario1' }, async ({ log, testFixtureScenario1 }) => {
  log(`BeforeStep 3 (@scenario1)`);
});

AfterStep(async ({ log, testFixtureCommon }) => {
  log(`AfterStep 1`);
});

AfterStep(async ({ log }) => {
  log(`AfterStep 2`);
});

AfterStep({ tags: '@scenario1' }, async ({ log, testFixtureScenario1 }) => {
  log(`AfterStep 3 (@scenario1)`);
});
