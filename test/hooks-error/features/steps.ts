import { expect } from '@playwright/test';
import timers from 'node:timers/promises';

import { Given, Before, BeforeAll, After, AfterAll } from './fixtures';

// use tiny delay to avoid race conditions on stdout output
const delay = async () => await timers.setTimeout(50);

Before(async function ({ $tags, $testInfo, page, track }) {
  await delay();
  track(`Before 1 ${$testInfo.title}`);
  expect(page).toBeDefined();
  expect($tags).toEqual([]);
});

Before(async ({ $testInfo, track }) => {
  await delay();
  track(`Before 2 ${$testInfo.title}`);
});

After(async function ({ $testInfo, track }) {
  await delay();
  track(`After 1 ${$testInfo.title}`);
});

After(async ({ $testInfo, page, track }) => {
  await delay();
  track(`After 2 ${$testInfo.title}`);
  expect(page).toBeDefined();
});

BeforeAll(async function ({ browser, track }) {
  await delay();
  track(`BeforeAll 1`);
  expect(browser).toBeDefined();
});

BeforeAll(async ({ track }) => {
  await delay();
  track(`BeforeAll 2`);
});

AfterAll(async function ({ browser, track }) {
  await delay();
  track(`AfterAll 1`);
  expect(browser).toBeDefined();
});

AfterAll(async ({ track }) => {
  await delay();
  track(`AfterAll 2`);
});

Given('Step {int}', async ({ track }, n: number) => {
  track(`Step ${n}`);
});

Given('Step bg', async ({ track }) => {
  track(`Step bg`);
});

/*
function track(hookTitle: string) {
  logger.log(`track: ${hookTitle}`);
  // calls.push(hookTitle);
  const shouldThrow = process.env.ERROR && hookTitle.startsWith(process.env.ERROR);
  if (shouldThrow) {
    throw new Error(hookTitle);
  }
  // const isBeforeAll = hookTitle.startsWith('BeforeAll');
  // const isLastHook = hookTitle.startsWith('AfterAll 1 ');
  // if ((shouldThrow && isBeforeAll) || isLastHook) {
  //   logger.log(['Start', ...calls, 'End'].join('\n'));
  // }
  // if (shouldThrow) {
  //   throw new Error(hookTitle);
  // }
}
*/
