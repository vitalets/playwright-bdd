import { test as base, createBdd } from 'playwright-bdd';
import { withLog } from '../../_helpers/withLog';

export const test = withLog(base);

const { BeforeScenario, AfterScenario } = createBdd(test, { tags: '@scenario1' });
const { Given } = createBdd(test);

BeforeScenario(async ({ log }) => {
  log(`BeforeScenario`);
});

BeforeScenario({ tags: 'not @scenario1' }, async ({}) => {
  throw new Error(`Should not be called`);
});

AfterScenario(async ({ log }) => {
  log(`AfterScenario`);
});

AfterScenario({ tags: 'not @scenario1' }, async ({}) => {
  throw new Error(`Should not be called`);
});

Given('a step', async ({ log, $testInfo }) => {
  log(`${$testInfo.title}: a step`);
});
