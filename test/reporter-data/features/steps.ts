/* if refactor this file, locations in test can shift */
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, When, Before, After, BeforeAll, AfterAll } = createBdd(test);

Given('background step', async () => {});
Given('I am on home page', async ({ myPage }) => {
  await myPage.open();
});
When('Action {int}', () => {});
Before({ name: 'named Before hook' }, async () => {});
Before(async () => {});
BeforeAll(async () => {});
BeforeAll({ name: 'named BeforeAll hook' }, async () => {});
AfterAll(async () => {});
AfterAll({ name: 'named AfterAll hook' }, async () => {});
After({ name: 'named After hook' }, async () => {});
After(async () => {});
