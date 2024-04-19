import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';
import { expect } from '@playwright/test';

const { Then } = createBdd(test);

Then('used fixtures {string}', ({ usedFixtures }, expectedFixtures: string) => {
  expect(usedFixtures.join(',')).toEqual(expectedFixtures);
});
