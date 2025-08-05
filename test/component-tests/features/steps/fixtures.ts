import { mergeTests } from '@playwright/test';
import { test as ctBase } from '@playwright/experimental-ct-react';
import { test as base, createBdd } from 'playwright-bdd';

// important: import all components here to make them registered in client-side bundle.
import './components';

export const test = mergeTests(ctBase, base).extend({
  world: ({}, use) => use({ clickedTimes: 0 }),
});

export const { Given, When, Then } = createBdd(test);
