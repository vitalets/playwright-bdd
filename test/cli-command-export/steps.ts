import { createBdd } from '../../dist';

const { Given, When, Then, Step } = createBdd();

Given('I am on todo page', async () => {
  // noop
});

When('I add todo {string}', async () => {
  // noop
});

Then(/visible todos count is (\d+)/, async () => {
  // noop
});

Step('some step', async () => {
  // noop
});
