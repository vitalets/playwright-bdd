import { Page } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';

type Ctx = { page: Page };

export const test = base.extend<{ ctx: Ctx }>({
  ctx: async ({}, use) => {
    const ctx = {} as Ctx; // <- will be initialized in steps
    await use(ctx);
    await ctx.page?.context().close();
  },
});

export const { Given, When, Then } = createBdd(test);
