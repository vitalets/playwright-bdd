import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({
  baseURL: async ({}, use) => use(process.env.APP_URL),
});

export const { Given, When, Then } = createBdd(test);
