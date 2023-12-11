// keep this file as .js because @playwright/test has mergeTest only since 1.39
import { mergeTests } from '@playwright/test';
import { test as ctBase } from '@playwright/experimental-ct-react';
import { test as base } from 'playwright-bdd';

export const test = mergeTests(base, ctBase).extend({
  world: ({}, use) => use({ clickedTimes: 0 }),
});
