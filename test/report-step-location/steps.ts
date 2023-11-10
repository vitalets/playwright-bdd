import { createBdd } from '../../dist';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('I am on home page', async ({ myPage }) => {
  await myPage.open();
});

Given('I do something', async () => {});
