import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When } = createBdd();

Given('success step {int}', async ({}, _step: number) => {});

When('{string} step', ({}, type: 'failing' | 'passing') => {
  if (type === 'failing') expect(1).toEqual(2);
});
