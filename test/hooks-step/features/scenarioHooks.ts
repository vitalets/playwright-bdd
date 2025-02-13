/* eslint-disable @typescript-eslint/no-unused-vars */
import { Before, After } from './fixtures';

Before(async ({ log, testFixtureCommon }) => {
  log(`Before 1`);
});

Before(async ({ log }) => {
  log(`Before 2`);
});

Before({ tags: '@scenario1' }, async ({ log, testFixtureScenario1 }) => {
  log(`Before 3 (@scenario1)`);
});

After(async ({ log, testFixtureCommon }) => {
  log(`After 1`);
});

After(async ({ log }) => {
  log(`After 2`);
});

After({ tags: '@scenario1' }, async ({ log, testFixtureScenario1 }) => {
  log(`After 3 (@scenario1)`);
});
