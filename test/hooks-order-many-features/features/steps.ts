import { Given } from './fixtures';

Given('a step', ({ log, $testInfo }) => {
  log(`a step of ${$testInfo.title}`);
});
