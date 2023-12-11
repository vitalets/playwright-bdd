import { test as ctBase } from '@playwright/experimental-ct-react';
import { test as base } from 'playwright-bdd';
import { mergeTests } from './mergeTests';

type Fixtures = {
  world: {
    clickedTimes: number;
  };
};

export const test = mergeTests(base, ctBase).extend<Fixtures>({
  world: ({}, use) => use({ clickedTimes: 0 }),
});
