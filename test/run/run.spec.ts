import { test } from '../../src';

// eslint-disable-next-line no-empty-pattern
test.beforeEach(async ({}, testInfo) => {
  process.env.CUCUMBER_REQUIRE = /custom world/i.test(testInfo.title)
    ? 'test/run/custom-world.steps.ts'
    : 'test/run/steps.ts';
});

test('Default World contains fixtures and testInfo', async ({ Then }, {
  title,
}) => {
  await Then(title);
});

test('Custom World contains fixtures and testInfo', async ({ Then }, {
  title,
}) => {
  await Then(title);
});
