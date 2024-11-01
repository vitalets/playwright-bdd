import { createBdd } from 'playwright-bdd';

const { After, Given } = createBdd();

Given('success step {int}', async () => {});
After(async ({ $testInfo }) => {
  $testInfo.skip();
});
