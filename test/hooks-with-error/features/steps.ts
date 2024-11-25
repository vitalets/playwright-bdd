import { Given, Before, BeforeAll, After, AfterAll } from './fixtures';

Before(async function ({ $testInfo, log }) {
  log(`Before 1 ${$testInfo.title}`);
  canThrow('Before 1');
});

Before(async ({ $testInfo, log }) => {
  log(`Before 2 ${$testInfo.title}`);
  canThrow('Before 2');
});

After(async function ({ $testInfo, log }) {
  log(`After 1 ${$testInfo.title}`);
  canThrow('After 1');
});

After(async ({ $testInfo, log }) => {
  log(`After 2 ${$testInfo.title}`);
  canThrow('After 2');
});

BeforeAll(async function ({ log }) {
  log(`BeforeAll 1`);
  canThrow('BeforeAll 1');
});

BeforeAll(async ({ log }) => {
  log(`BeforeAll 2`);
  canThrow('BeforeAll 2');
});

AfterAll(async function ({ log }) {
  log(`AfterAll 1`);
  canThrow('AfterAll 1');
});

AfterAll(async ({ log }) => {
  log(`AfterAll 2`);
  canThrow('AfterAll 2');
});

Given('Step {int}', async ({ log }, n: number) => {
  log(`Step ${n}`);
});

Given('Step bg', async ({ log }) => {
  log(`Step bg`);
});

function canThrow(hookTitle: string) {
  const shouldThrow = process.env.ERROR && hookTitle.startsWith(process.env.ERROR);
  if (shouldThrow) {
    throw new Error(hookTitle);
  }
}
