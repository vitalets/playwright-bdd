import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();
const logger = console;

Given('step without tags', async ({ $testInfo }) => {
  logger.log(`${$testInfo.title}: step without tags`);
});

Given('step bound to feature', { tags: '@foo' }, async ({ $testInfo }) => {
  logger.log(`${$testInfo.title}: step for @foo`);
});

Given('step bound to feature', { tags: '@bar' }, async ({ $testInfo }) => {
  logger.log(`${$testInfo.title}: step for @bar`);
});

Given('step bound to scenario', { tags: '@baz1' }, async ({ $testInfo }) => {
  logger.log(`${$testInfo.title}: step for @baz1`);
});

Given('step bound to scenario', { tags: '@baz2' }, async ({ $testInfo }) => {
  logger.log(`${$testInfo.title}: step for @baz2`);
});
