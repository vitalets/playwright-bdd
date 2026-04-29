import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('state {int}', async ({}, _state: number) => {
  // noop
});
