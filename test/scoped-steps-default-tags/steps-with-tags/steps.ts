import { createBdd } from 'playwright-bdd';
import { testWithLog } from '../../_helpers/withLog';

export const test = testWithLog;

const { Given: GivenScenario1 } = createBdd(test, { tags: '@scenario1' });
const { Given: GivenScenario2 } = createBdd(test, { tags: '@scenario2' });

GivenScenario1('a step', async ({ log, $testInfo }) => {
  log(`${$testInfo.title}: step with @scenario1`);
});

GivenScenario2('a step', async ({ log, $testInfo }) => {
  log(`${$testInfo.title}: step with @scenario2`);
});

GivenScenario2('a step', { tags: 'not @scenario2' }, async ({}) => {
  throw new Error(`Should not be called`);
});
