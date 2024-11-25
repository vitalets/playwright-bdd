import { Given } from './fixtures';

Given('bg step', async ({ log, $testInfo }) => {
  log(`bg step of ${$testInfo.title}`);
});

Given('a step', async ({ log, $testInfo }) => {
  log(`a step of ${$testInfo.title}`);
});
