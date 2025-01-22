import { test as base } from 'playwright-bdd';

export const test = base.extend<{
  fixtureWithErrorInSetup: void;
  fixtureWithErrorInSetupStep: void;
  fixtureWithTimeoutInSetup: void;
}>({
  fixtureWithErrorInSetup: async ({}, use, testInfo) => {
    await testInfo.attach('my attachment', { body: '|outside step' });
    await (async () => {
      await testInfo.attach('my attachment', { body: '|in step' });
      throw new Error('error in fixture setup');
    })();
    await use();
    await testInfo.attach('my attachment', { body: 'should not attach' });
  },
  fixtureWithErrorInSetupStep: async ({}, use, testInfo) => {
    await testInfo.attach('my attachment', { body: '|outside step' });
    await test.step('step inside fixture', async () => {
      await testInfo.attach('my attachment', { body: '|in step' });
      throw new Error('error in fixture setup');
    });
    await use();
    await testInfo.attach('my attachment', { body: 'should not attach' });
  },
  fixtureWithTimeoutInSetup: async ({}, use, testInfo) => {
    await new Promise((r) => setTimeout(r, testInfo.timeout + 100));
    await use();
  },
});
