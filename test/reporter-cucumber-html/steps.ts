import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('Action {int}', () => {});
When('Step with data table', () => {});
When('Step with doc string', () => {});
When('attach json', async () => {
  // await $testInfo.attach('json', {
  // });
});
When('attach image inline', () => {});
Then('attach image as file', async () => {
  // await page.goto('https://example.com');
  // await $testInfo.attach('screenshot', )
});
