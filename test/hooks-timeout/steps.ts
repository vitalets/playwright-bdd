import timers from 'node:timers/promises';
import { createBdd } from 'playwright-bdd';

const { Given, Before, BeforeAll, After, AfterAll } = createBdd();

const calls: string[] = [];

Before({ timeout: 5 }, async function () {
  await track(`Before 1 ${this.testInfo.title}`);
});
Before(async ({ $bddWorld }) => {
  await track(`Before 2 ${$bddWorld.testInfo.title}`);
});
After(async function () {
  await track(`After 1 ${this.testInfo.title}`);
});
After({ timeout: 5 }, async ({ $bddWorld }) => {
  await track(`After 2 ${$bddWorld.testInfo.title}`);
});

BeforeAll({ timeout: 5 }, async function ({ $workerInfo }) {
  await track(`BeforeAll 1 worker ${$workerInfo.workerIndex}`);
});
BeforeAll(async ({ $workerInfo }) => {
  await track(`BeforeAll 2 worker ${$workerInfo.workerIndex}`);
});
AfterAll(async function ({ $workerInfo }) {
  await track(`AfterAll 1 worker ${$workerInfo.workerIndex}`);
});
AfterAll({ timeout: 5 }, async ({ $workerInfo }) => {
  await track(`AfterAll 2 worker ${$workerInfo.workerIndex}`);
});

Given('State {int}', async ({ $testInfo }) => {
  await track(`Step ${$testInfo.title}`);
});

// eslint-disable-next-line complexity
async function track(hookTitle: string) {
  calls.push(hookTitle);
  const shouldTimeout = process.env.TIMEOUT && hookTitle.startsWith(process.env.TIMEOUT);
  const isBeforeAll = hookTitle.startsWith('BeforeAll');
  const isLastHook = hookTitle.startsWith('AfterAll 1 ');
  if ((shouldTimeout && isBeforeAll) || isLastHook) {
    // eslint-disable-next-line no-console
    console.log(['Start', ...calls, 'End'].join('\n'));
  }
  if (shouldTimeout) {
    await timers.setTimeout(100);
  }
}
