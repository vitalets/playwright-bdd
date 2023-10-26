import { test as ctBase } from '@playwright/experimental-ct-react';
import { createBddTest } from '../../../dist';

type Fixtures = {
  world: {
    clickedTimes: number;
  };
};

export const test = createBddTest(ctBase).extend<Fixtures>({
  world: ({}, use) => use({ clickedTimes: 0 }),
});
