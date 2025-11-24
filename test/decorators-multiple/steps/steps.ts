import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';
import { expect } from '@playwright/test';

const { Then } = createBdd(test);

Then('log contains {string}', ({ log }, expected: string) => {
  expect(log.join(',')).toEqual(expected);
});

Then('log is {string}', ({ log }, expected: string) => {
  expect(log.join(',')).toEqual(expected);
});
