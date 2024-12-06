import { APIResponse } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';

type Fixtures = {
  ctx: { response: APIResponse };
};

export const test = base.extend<Fixtures>({
  ctx: async ({}, use) => {
    const ctx = {} as Fixtures['ctx'];
    await use(ctx);
  },
});

export const { Given, When, Then } = createBdd(test);
