import { test as ctBase } from '@playwright/experimental-ct-react'
import { BddFixtures, bddFixtures } from '../../../dist';

type Fixtures = {
  ctx: Record<string, string>;
};

const bddCtBase = ctBase.extend<BddFixtures>(bddFixtures);
export const test = bddCtBase.extend<Fixtures>({
  ctx: ({}, use) => use({}),
});
