import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Before, BeforeAll, After, AfterAll } = createBdd();

const calls: string[] = [];

Before(async function ({ $tags, $testInfo, page }) {
  track(`Before 1 ${$testInfo.title}`);
  expect($tags).toEqual([]);
  expect($testInfo.title).toBeDefined();
  expect(page).toBeDefined();
});
Before(async ({ $testInfo }) => {
  track(`Before 2 ${$testInfo.title}`);
});
After(async function ({ $testInfo }) {
  track(`After 1 ${$testInfo.title}`);
});
After(async ({ $testInfo, page }) => {
  track(`After 2 ${$testInfo.title}`);
  expect(page).toBeDefined();
});

BeforeAll(async function ({ browser, $workerInfo }) {
  track(`BeforeAll 1 worker ${$workerInfo.workerIndex}`);
  expect(browser).toBeDefined();
});
BeforeAll(async ({ $workerInfo }) => {
  track(`BeforeAll 2 worker ${$workerInfo.workerIndex}`);
});
AfterAll(async function ({ browser, $workerInfo }) {
  track(`AfterAll 1 worker ${$workerInfo.workerIndex}`);
  expect(browser).toBeDefined();
});
AfterAll(async ({ $workerInfo }) => {
  track(`AfterAll 2 worker ${$workerInfo.workerIndex}`);
});

Given('State {int}', async ({ $testInfo }) => {
  track(`Step ${$testInfo.title}`);
});

function track(hookTitle: string) {
  calls.push(hookTitle);
  const shouldThrow = process.env.ERROR && hookTitle.startsWith(process.env.ERROR);
  const isBeforeAll = hookTitle.startsWith('BeforeAll');
  const isLastHook = hookTitle.startsWith('AfterAll 1 ');
  if ((shouldThrow && isBeforeAll) || isLastHook) {
    // eslint-disable-next-line no-console
    console.log(['Start', ...calls, 'End'].join('\n'));
  }
  if (shouldThrow) {
    throw new Error(hookTitle);
  }
}
