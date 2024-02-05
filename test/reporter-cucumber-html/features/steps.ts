import fs from 'node:fs';
import path from 'node:path';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { When, Then } = createBdd(test);

When('Action {int}', () => {});
When('Step with data table', () => {});
When('Step with doc string', () => {});

When('attach text via testInfo', async ({ $testInfo }) => {
  await $testInfo.attach('text attachment', { body: 'some text' });
});

When('attach image inline via testInfo', async ({ $testInfo }) => {
  await $testInfo.attach('image attachment inline', {
    body: fs.readFileSync(path.join(__dirname, 'cucumber.png')),
    contentType: 'image/png',
  });
});

Then('attach image as file via testInfo', async ({ $testInfo }) => {
  await $testInfo.attach('image attachment as file', {
    path: path.join(__dirname, 'cucumber.png'),
    contentType: 'image/png',
  });
});

When('attach log via Cucumber', async ({ $bddWorld }) => {
  $bddWorld.log('some logs');
});

When('attach text via Cucumber', async ({ $bddWorld }) => {
  const body = JSON.stringify({ message: 'The <b>big</b> question', foo: 'bar' });
  $bddWorld.attach(body, 'application/json');
});

When('attach image via Cucumber', async ({ $bddWorld }) => {
  const fileStream = fs.createReadStream(path.join(__dirname, 'cucumber.png'));
  await $bddWorld.attach(fileStream, 'image/png');
});
