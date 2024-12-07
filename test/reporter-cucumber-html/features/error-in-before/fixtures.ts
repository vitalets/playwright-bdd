import { test as base } from 'playwright-bdd';

export const test = base.extend<{
  failingBeforeFixtureNoStep: void;
  failingBeforeFixtureWithStep: void;
  timeoutedBeforeFixture: void;
  timeoutedAfterFixture: void;
}>({
  failingBeforeFixtureNoStep: async ({}, use, testInfo) => {
    await testInfo.attach('my attachment', { body: '|outside step' });
    await (async () => {
      await testInfo.attach('my attachment', { body: '|in step' });
      throw new Error('error in failingBeforeFixtureNoStep');
    })();
    await use();
    await testInfo.attach('my attachment', { body: 'should not attach' });
  },
  failingBeforeFixtureWithStep: async ({}, use, testInfo) => {
    await testInfo.attach('my attachment', { body: '|outside step' });
    await test.step('my step', async () => {
      await testInfo.attach('my attachment', { body: '|in step' });
      throw new Error('error in failingBeforeFixtureWithStep');
    });
    await use();
    await testInfo.attach('my attachment', { body: 'should not attach' });
  },
  timeoutedBeforeFixture: async ({}, use, testInfo) => {
    await new Promise((r) => setTimeout(r, testInfo.timeout + 100));
    await use();
  },
});
