import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('delay {int}', async ({}, delay: number) => {
  await new Promise((r) => setTimeout(r, delay));
});
