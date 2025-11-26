import { Page } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';

type Ctx = { page: Page };

export const test = base.extend<{ ctx: Ctx }>({
  ctx: async ({}, use, testInfo) => {
    const ctx = {} as Ctx; // <- will be initialized in steps
    await use(ctx);
    // See: https://github.com/vitalets/playwright-bdd/issues/344
    if (testInfo.status === 'timedOut') return;
    await ctx.page?.context().close();
  },
});

export const { Given, When, Then } = createBdd(test);
