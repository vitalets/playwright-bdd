import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('a step writes an empty chunk to stderr', async () => {
  // Node's execFileSync without the stdio option does the same:
  // it writes the child's stderr to the parent's, even when it's empty.
  process.stderr.write(Buffer.alloc(0));
});

Given('a step logs some output', async () => {
  // eslint-disable-next-line no-console
  console.log('some output');
});

Given('a step attaches an empty text', async ({ $testInfo }) => {
  await $testInfo.attach('empty text', { body: '', contentType: 'text/plain' });
});

Given('a step does nothing', async () => {});
