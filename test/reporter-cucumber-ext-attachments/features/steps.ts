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
    contentType: 'application/json',
  });
});

Given('attach image', async ({ $testInfo }) => {
  await $testInfo.attach('my image', {
    path: path.join(__dirname, 'cucumber.png'),
    contentType: 'image/png',
  });
});

// See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/attachment_manager/index.ts#L59
Given('attach links', async ({ $testInfo }) => {
  await $testInfo.attach('Links', {
    body: [
      'https://github.com/cucumber/cucumber-js',
      'https://github.com/cucumber/cucumber-jvm',
    ].join('\n'),
    contentType: 'text/uri-list',
  });
});
