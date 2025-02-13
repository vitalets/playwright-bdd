import { Given } from './fixtures';

Given('bg step', async ({ log, $testInfo }) => {
  log(`bg step of ${$testInfo.title}`);
});

Given('step {int}', async ({ log }, n: number) => {
  log(`step ${n}`);
});
