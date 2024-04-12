import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, When, Before } = createBdd(test);

Given('background step', async () => {});
Given('I am on home page', async ({ myPage }) => {
  await myPage.open();
});

When('Action {int}', () => {});
When('Состояние {int}', () => {});

Before({ name: 'hook 1' }, async () => {});
