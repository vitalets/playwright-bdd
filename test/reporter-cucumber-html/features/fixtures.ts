import { test as base } from 'playwright-bdd';

export const test = base.extend<{
  failingBeforeFixtureNoStep: void;
  failingBeforeFixtureWithStep: void;
  failingAfterFixtureNoStep: void;
  failingAfterFixtureWithStep: void;
}>({
  failingBeforeFixtureNoStep: async ({}, use, testInfo) => {
    await testInfo.attach('attachment in failingBeforeFixtureNoStep', { body: 'foo' });
    await (async () => {
      throw new Error('error in failingBeforeFixtureNoStep');
    })();
    await use();
  },
  failingBeforeFixtureWithStep: async ({}, use, testInfo) => {
    await testInfo.attach('attachment in failingBeforeFixtureWithStep (before use)', {
      body: 'foo',
    });
    await test.step('step in failingBeforeFixtureWithStep', async () => {
      await testInfo.attach('attachment in step in failingBeforeFixtureWithStep', { body: 'bar' });
      throw new Error('error in failingBeforeFixtureWithStep');
    });
    await use();
  },
  failingAfterFixtureNoStep: async ({}, use, testInfo) => {
    await testInfo.attach('attachment in failingAfterFixtureNoStep (before use)', { body: 'foo' });
    await use();
    await testInfo.attach('attachment in failingAfterFixtureNoStep (after use)', { body: 'bar' });
    throw new Error('error in failingAfterFixtureNoStep');
  },
  failingAfterFixtureWithStep: async ({}, use, testInfo) => {
    await testInfo.attach('attachment in failingAfterFixtureWithStep (before use)', {
      body: 'foo',
    });
    await use();
    await testInfo.attach('attachment in failingAfterFixtureWithStep (after use)', {
      body: 'bar',
    });
    await test.step('step in failingAfterFixtureWithStep', async () => {
      await testInfo.attach('attachment in step in failingAfterFixtureWithStep', {
        body: 'baz',
      });
      throw new Error('error in failingAfterFixtureWithStep');
    });
  },
});
