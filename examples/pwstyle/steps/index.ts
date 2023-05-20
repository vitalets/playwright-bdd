import { Given, When, Then } from './fixtures';

Given('I open url {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

When('I click link {string}', async ({ myPage }, name: string) => {
  await myPage.clickLink(name);
});

Then('I see in title {string}', async ({ myPage }, text: string) => {
  await myPage.matchTitle(text);
});
