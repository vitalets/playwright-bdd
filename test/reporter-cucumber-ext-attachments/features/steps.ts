import path from 'node:path';
import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

// we need page here to get video and trace by Playwright
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Given('attach plain text', async ({ page, $testInfo }) => {
  await $testInfo.attach('plain text', {
    body: 'foo',
  });
});

Given('attach console log', async () => {
  // eslint-disable-next-line no-console
  console.log('console log text');
});

Given('attach json', async ({ $testInfo }) => {
  await $testInfo.attach('json', {
    body: JSON.stringify({ foo: 'bar' }),
  });
});

Given('attach image', async ({ $testInfo }) => {
  await $testInfo.attach('my image', {
    path: path.join(__dirname, 'cucumber.png'),
    contentType: 'image/png',
  });
});

// When('attach url list', async ({ $testInfo }) => {
//   await $testInfo.attach('ignored text', {
//     body: 'bar',
//     contentType: 'x-ignored-type',
//   });
// });
