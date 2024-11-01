import { createBdd } from 'playwright-bdd';

const { Before, Given } = createBdd();

Given('success step {int}', async () => {});
Before(async ({ $testInfo }) => {
  $testInfo.skip();
});
