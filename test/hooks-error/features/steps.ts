import { Given, Before, BeforeAll, After, AfterAll } from './fixtures';

Before(async function ({ $testInfo, track }) {
  track(`Before 1 ${$testInfo.title}`);
  canThrow('Before 1');
});

Before(async ({ $testInfo, track }) => {
  track(`Before 2 ${$testInfo.title}`);
  canThrow('Before 2');
});

After(async function ({ $testInfo, track }) {
  track(`After 1 ${$testInfo.title}`);
  canThrow('After 1');
});

After(async ({ $testInfo, track }) => {
  track(`After 2 ${$testInfo.title}`);
  canThrow('After 2');
});

BeforeAll(async function ({ track }) {
  track(`BeforeAll 1`);
  canThrow('BeforeAll 1');
});

BeforeAll(async ({ track }) => {
  track(`BeforeAll 2`);
  canThrow('BeforeAll 2');
});

AfterAll(async function ({ track }) {
  track(`AfterAll 1`);
  canThrow('AfterAll 1');
});

AfterAll(async ({ track }) => {
  track(`AfterAll 2`);
  canThrow('AfterAll 2');
});

Given('Step {int}', async ({ track }, n: number) => {
  track(`Step ${n}`);
});

Given('Step bg', async ({ track }) => {
  track(`Step bg`);
});

function canThrow(hookTitle: string) {
  const shouldThrow = process.env.ERROR && hookTitle.startsWith(process.env.ERROR);
  if (shouldThrow) {
    throw new Error(hookTitle);
  }
}
