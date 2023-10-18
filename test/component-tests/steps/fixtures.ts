import { test as ctBase } from '@playwright/experimental-ct-react';
import { BddFixtures, bddFixtures } from '../../../dist';

type Fixtures = {
  world: {
    clickedTimes: number;
  };
};

const bddCtBase = ctBase.extend<BddFixtures>(bddFixtures);
export const test = bddCtBase.extend<Fixtures>({
  world: ({}, use) => use({ clickedTimes: 0 }),
});
