import { Given } from './fixtures';
import { track } from './track';

Given('State {int}', async ({ $testInfo }) => {
  track(`Step ${$testInfo.title}`);
});
