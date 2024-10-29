import timers from 'node:timers/promises';
import { Given, Before, BeforeAll, After, AfterAll } from './fixtures';

// worker hooks

BeforeAll({ timeout: 5 }, async function ({ track }) {
  track(`BeforeAll 1`);
  await canTimeout(`BeforeAll 1`);
});

BeforeAll(async ({ track }) => {
  track(`BeforeAll 2`);
  await canTimeout(`BeforeAll 2`);
});

AfterAll(async function ({ track }) {
  track(`AfterAll 1`);
  await canTimeout(`AfterAll 1`);
});

AfterAll({ timeout: 5 }, async ({ track }) => {
  track(`AfterAll 2`);
  await canTimeout(`AfterAll 2`);
});

// scenario hooks

Before({ timeout: 5 }, async function ({ $testInfo, track }) {
  track(`Before 1 ${$testInfo.title}`);
  await canTimeout(`Before 1`);
});

Before(async ({ $testInfo, track }) => {
  track(`Before 2 ${$testInfo.title}`);
  await canTimeout(`Before 2`);
});

After(async function ({ $testInfo, track }) {
  track(`After 1 ${$testInfo.title}`);
  await canTimeout(`After 1`);
});

After({ timeout: 5 }, async ({ $testInfo, track }) => {
  track(`After 2 ${$testInfo.title}`);
  await canTimeout(`After 2`);
});

// step

Given('State {int}', async ({ $testInfo, track }) => {
  track(`Step ${$testInfo.title}`);
});

async function canTimeout(hookTitle: string) {
  const shouldTimeout = process.env.TIMEOUT && hookTitle.startsWith(process.env.TIMEOUT);
  if (shouldTimeout) {
    await timers.setTimeout(100);
  }
}
