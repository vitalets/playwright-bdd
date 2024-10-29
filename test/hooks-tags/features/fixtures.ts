import timers from 'node:timers/promises';
import { mergeTests } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import { test as testWithTrack } from '../../_helpers/track';

export const test = mergeTests(base, testWithTrack).extend<{
  fixtureForFoo: void;
  fixtureForBar: void;
}>({
  fixtureForFoo: async ({ track }, use) => {
    // tiny delay to have always foo after bar
    await timers.setTimeout(50);
    track(`setup fixture for foo`);
    await use();
  },

  fixtureForBar: async ({ track }, use) => {
    track(`setup fixture for bar`);
    await use();
  },
});

export const { Given, Before, After, AfterAll } = createBdd(test);
