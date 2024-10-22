import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('unique step', async () => {});

Given('duplicate step', async () => {});
When('duplicate step', async () => {});
Then('duplicate step', async () => {});
