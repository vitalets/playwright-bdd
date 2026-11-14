import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('I log {string}', async ({}, value: string) => {
  process.stdout.write(`${value}\n`);
});
