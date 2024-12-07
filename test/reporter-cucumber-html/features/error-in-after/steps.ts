import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

// todo: error in after hook

Given('step that uses failingAfterFixtureNoStep', async ({ failingAfterFixtureNoStep }) => {
  return failingAfterFixtureNoStep;
});

Given('step that uses failingAfterFixtureWithStep', async ({ failingAfterFixtureWithStep }) => {
  return failingAfterFixtureWithStep;
});

Given('step that uses timeouted after fixture', async ({ timeoutedAfterFixture }) => {
  return timeoutedAfterFixture;
});
