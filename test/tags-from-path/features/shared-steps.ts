import { createBdd } from 'playwright-bdd';
import { testWithLog } from '../../_helpers/withLog';

export const test = testWithLog;

const { Given } = createBdd(test);

Given('a shared step', async ({ log, $testInfo }) => {
  log(`${$testInfo.title}: a shared step`);
});
