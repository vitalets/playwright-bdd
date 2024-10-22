import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('duplicate step 1', async () => {});
Given('duplicate step {int}', async () => {});
