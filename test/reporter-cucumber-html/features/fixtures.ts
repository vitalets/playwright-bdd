import { test as base } from 'playwright-bdd';

export const test = base.extend<{
  failingBeforeFixtureNoStep: void;
  failingBeforeFixtureWithStep: void;
  failingAfterFixtureNoStep: void;
  failingAfterFixtureWithStep: void;
  setTestTimeout: void;
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
  timeoutedBeforeFixture: async ({}, use, testInfo) => {
    await new Promise((r) => setTimeout(r, testInfo.timeout + 100));
    await use();
  },
  timeoutedAfterFixture: async ({}, use, testInfo) => {
    await use();
    await new Promise((r) => setTimeout(r, testInfo.timeout + 100));
  },
});
