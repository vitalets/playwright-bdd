import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();
const logger = console;

Given('step without tags', async ({ $testInfo }) => {
  logger.log(`running step without tags: ${$testInfo.title}`);
});

Given('step bound to feature', { tags: '@foo' }, async ({ $testInfo }) => {
  logger.log(`running step for @foo: ${$testInfo.title}`);
});

Given('step bound to feature', { tags: '@bar' }, async ({ $testInfo }) => {
  logger.log(`running step for @bar: ${$testInfo.title}`);
});

Given('step bound to scenario', { tags: '@baz1' }, async ({ $testInfo }) => {
  logger.log(`running step for @baz1: ${$testInfo.title}`);
});

Given('step bound to scenario', { tags: '@baz2' }, async ({ $testInfo }) => {
  logger.log(`running step for @baz2: ${$testInfo.title}`);
});
