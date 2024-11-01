import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('success step {int}', async () => {});

Given('skipped by test info', async ({ $testInfo }) => {
  $testInfo.skip();
});
