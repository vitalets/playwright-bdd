import { createBdd } from '../../dist';
import { test } from './fixtures';

const { Given, When } = createBdd(test);

Given('I am on home page', async ({ myPage }) => {
  await myPage.open();
});

When('Action {int}', () => {});
When('Состояние {int}', () => {});
