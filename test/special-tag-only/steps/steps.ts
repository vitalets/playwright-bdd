import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('{string} step', ({}, type: 'failing' | 'passing') => {
  if (type === 'failing') expect(1).toEqual(2);
});
