import { Given } from './fixtures';
import { track } from './track';

const logger = console;

Given('State {int}', async ({ $testInfo }) => {
  track(`Step ${$testInfo.title}`);
});

Given('step in sample2', async () => {
  logger.log(`step in sample2`);
});
