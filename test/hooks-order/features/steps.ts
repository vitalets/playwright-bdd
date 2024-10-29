import { Given, Before, BeforeAll, After, AfterAll } from './fixtures';

Before(async function ({ $testInfo, track }) {
  track(`Before 1 ${$testInfo.title}`);
});

Before(async ({ $testInfo, track }) => {
  track(`Before 2 ${$testInfo.title}`);
});

After(async function ({ $testInfo, track }) {
  track(`After 1 ${$testInfo.title}`);
});

After(async ({ $testInfo, track }) => {
  track(`After 2 ${$testInfo.title}`);
});

BeforeAll(async function ({ track }) {
  track(`BeforeAll 1`);
});

BeforeAll(async ({ track }) => {
  track(`BeforeAll 2`);
});

AfterAll(async function ({ track }) {
  track(`AfterAll 1`);
});

AfterAll(async ({ track }) => {
  track(`AfterAll 2`);
});

Given('Step {int}', async ({ track }, n: number) => {
  track(`Step ${n}`);
});

Given('Step bg', async ({ track }) => {
  track(`Step bg`);
});
