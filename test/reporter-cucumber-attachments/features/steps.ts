import { createBdd } from 'playwright-bdd';

const { When } = createBdd();

// we need page here to get video and trace by Playwright
// eslint-disable-next-line @typescript-eslint/no-unused-vars
When('attach regular text', async ({ page, $testInfo }) => {
  await $testInfo.attach('regular text', {
    body: 'foo',
  });
});

When('attach ignored text', async ({ $testInfo }) => {
  await $testInfo.attach('ignored text', {
    body: 'bar',
    contentType: 'x-ignored-type',
  });
});
