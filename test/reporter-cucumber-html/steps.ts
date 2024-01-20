import fs from 'node:fs';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('Action {int}', () => {});
When('Step with data table', () => {});
When('Step with doc string', () => {});
When('attach text', async ({ $testInfo }) => {
  await $testInfo.attach('text attachment', { body: 'some text' });
});
When('attach image inline', async ({ $testInfo }) => {
  await $testInfo.attach('image attachment inline', {
    body: fs.readFileSync('cucumber.png'),
    contentType: 'image/png',
  });
});
Then('attach image as file', async () => {
  // await page.goto('https://example.com');
  // await $testInfo.attach('screenshot', )
});
