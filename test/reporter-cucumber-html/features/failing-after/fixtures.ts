import { test as base } from 'playwright-bdd';

export const test = base.extend<{
  fixtureWithErrorInTeardown: void;
  fixtureWithErrorInTeardownStep: void;
  fixtureWithTimeoutInTeardown: void;
}>({
  fixtureWithErrorInTeardown: async ({}, use, testInfo) => {
    await testInfo.attach('my attachment', { body: '|before use' });
    await use();
    await testInfo.attach('my attachment', { body: '|after use' });
    throw new Error('error in fixture teardown');
  },
  fixtureWithErrorInTeardownStep: async ({}, use, testInfo) => {
    await testInfo.attach('my attachment', { body: '|outside step (before use)' });
    await use();
    await testInfo.attach('my attachment', { body: '|outside step (after use)' });
    await test.step('step inside fixture', async () => {
      await testInfo.attach('my attachment', { body: '|in step' });
      throw new Error('error in fixture teardown');
    });
  },
  fixtureWithTimeoutInTeardown: async ({}, use, testInfo) => {
    await use();
    await new Promise((r) => setTimeout(r, testInfo.timeout + 100));
  },
});
