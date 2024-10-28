import { Given, Before, BeforeAll, After, AfterAll } from './fixtures';

// scenario hooks

Before({ timeout: 5 }, async function ({ $testInfo, track }) {
  await track(`Before 1 ${$testInfo.title}`);
});

Before(async ({ $testInfo, track }) => {
  await track(`Before 2 ${$testInfo.title}`);
});

After(async function ({ $testInfo, track }) {
  await track(`After 1 ${$testInfo.title}`);
});

After({ timeout: 5 }, async ({ $testInfo, track }) => {
  await track(`After 2 ${$testInfo.title}`);
});

// worker hooks

BeforeAll({ timeout: 5 }, async function ({ track }) {
  await track(`BeforeAll 1`);
});

BeforeAll(async ({ track }) => {
  await track(`BeforeAll 2`);
});

AfterAll(async function ({ track }) {
  await track(`AfterAll 1`);
});

AfterAll({ timeout: 5 }, async ({ track }) => {
  await track(`AfterAll 2`);
});

// step

Given('State {int}', async ({ $testInfo, track }) => {
  await track(`Step ${$testInfo.title}`);
});
