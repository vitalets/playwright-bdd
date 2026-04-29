import { createBdd } from 'playwright-bdd';

const { After, Given } = createBdd();

Given('success step {int}', async ({}, _step: number) => {});
After(async ({ $testInfo }) => {
  $testInfo.skip();
});
