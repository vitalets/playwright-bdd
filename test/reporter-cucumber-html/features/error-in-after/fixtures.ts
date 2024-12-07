import { test as base } from 'playwright-bdd';

export const test = base.extend<{
  failingAfterFixtureNoStep: void;
  failingAfterFixtureWithStep: void;
  timeoutedAfterFixture: void;
}>({
  failingAfterFixtureNoStep: async ({}, use, testInfo) => {
    await testInfo.attach('my attachment', { body: '|before use' });
    await use();
    await testInfo.attach('my attachment', { body: '|after use' });
    throw new Error('error in failingAfterFixtureNoStep');
  },
  failingAfterFixtureWithStep: async ({}, use, testInfo) => {
    await testInfo.attach('my attachment', { body: '|outside step (before use)' });
    await use();
    await testInfo.attach('my attachment', { body: '|outside step (after use)' });
    await test.step('step in failingAfterFixtureWithStep', async () => {
      await testInfo.attach('my attachment', { body: '|in step' });
      throw new Error('error in failingAfterFixtureWithStep');
    });
  },
  timeoutedAfterFixture: async ({}, use, testInfo) => {
    await use();
    await new Promise((r) => setTimeout(r, testInfo.timeout + 100));
  },
});
