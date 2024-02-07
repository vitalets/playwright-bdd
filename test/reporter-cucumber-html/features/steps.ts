import fs from 'node:fs';
import path from 'node:path';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { When, Then } = createBdd(test);

When('Action {int}', () => {});
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
