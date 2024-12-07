import fs from 'node:fs';
import path from 'node:path';
import { createBdd } from 'playwright-bdd';

const { When, Then, Before, After } = createBdd();

When('Step with data table', () => {});
When('Step with doc string', () => {});

When('attach text', async ({ $testInfo }) => {
  await $testInfo.attach('text attachment', { body: 'some text' });
});

When('attach image inline', async ({ $testInfo }) => {
  await $testInfo.attach('image attachment inline', {
    body: fs.readFileSync(path.join(__dirname, 'cucumber.png')),
    contentType: 'image/png',
  });
});

Then('attach image as file', async ({ $testInfo }) => {
  await $testInfo.attach('image attachment as file', {
    path: path.join(__dirname, 'cucumber.png'),
    contentType: 'image/png',
  });
});

Then('attach stdout', async () => {
  console.log(123, 'some logs'); // eslint-disable-line no-console
  // don't test console.error b/c it poisons the output
});

Before({ name: 'success before hook', tags: '@success-before-hook' }, async ({}) => {});

After({ name: 'success after hook', tags: '@success-after-hook' }, async ({}) => {});
