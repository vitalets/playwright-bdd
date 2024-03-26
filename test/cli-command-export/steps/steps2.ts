import { createBdd } from 'playwright-bdd';

const { Given, When } = createBdd();

Given('I am on another todo page', async () => {
  // noop
});

// keep this step text equal to steps.ts
When('I add todo {string}', async () => {
  // noop
});
