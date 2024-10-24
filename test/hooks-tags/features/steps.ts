import { Given } from './fixtures';
import { track } from './hooks';

Given('State {int}', async ({ $testInfo }) => {
  track(`Step ${$testInfo.title}`);
});
