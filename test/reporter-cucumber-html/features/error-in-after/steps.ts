import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

// todo: error in after hook

Given('step that uses fixtureWithErrorInTeardown', async ({ fixtureWithErrorInTeardown }) => {
  return fixtureWithErrorInTeardown;
});

Given(
  'step that uses fixtureWithErrorInTeardownStep',
  async ({ fixtureWithErrorInTeardownStep }) => {
    return fixtureWithErrorInTeardownStep;
  },
);

Given('step that uses fixtureWithTimeoutInTeardown', async ({ fixtureWithTimeoutInTeardown }) => {
  return fixtureWithTimeoutInTeardown;
});
