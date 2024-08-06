import { Page } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';

type AuthUser = { page: Page };

export const test = base.extend<{ authUser: AuthUser }>({
  authUser: async ({}, use) => {
    const authUser = {} as AuthUser; // <- will be initialized in steps
    await use(authUser);
    await authUser.page?.context().close();
  },
});

export const { Given, When, Then } = createBdd(test);
