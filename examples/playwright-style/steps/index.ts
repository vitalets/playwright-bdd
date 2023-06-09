import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test);

Given('I open url {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

When(/^I click link "(.+)"$/, async ({ pwPage }, name: string) => {
  await pwPage.openLink(name);
});

Then('I see in title {string}', async ({ pwPage }, text: string) => {
  await pwPage.matchTitle(text);
});
