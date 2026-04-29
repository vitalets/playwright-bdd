import { createBdd } from 'playwright-bdd';

const { Before, Given } = createBdd();

Given('success step {int}', async ({}, _step: number) => {});
Before(async ({ $testInfo }) => {
  $testInfo.skip();
});
