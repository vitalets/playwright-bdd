import { test as base, createBdd } from 'playwright-bdd';
import { withLog } from '../../_helpers/withLog';

export const test = withLog(base);

const { Given } = createBdd(test);

Given('a shared step', async ({ log, $testInfo }) => {
  log(`${$testInfo.title}: a shared step`);
});
