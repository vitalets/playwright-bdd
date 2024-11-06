/* eslint-disable @typescript-eslint/no-unused-vars */

import { Given, logger } from './fixtures';

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

Given('bg step bound to scenario', { tags: '@baz1' }, async ({ $testInfo, fixtureBg1 }) => {
  logger.log(`${$testInfo.title}: bg step for @baz1`);
});

Given('bg step bound to scenario', { tags: '@baz2' }, async ({ $testInfo, fixtureBg2 }) => {
  logger.log(`${$testInfo.title}: bg step for @baz2`);
});
