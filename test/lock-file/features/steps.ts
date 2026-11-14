import { createBdd } from 'playwright-bdd';
import fs from 'node:fs';
import timers from 'node:timers/promises';

const { Given } = createBdd();

Given('generate test-running.txt', () => {
  fs.writeFileSync('test-running.txt', 'running');
});

Given('wait for test-running.txt to be removed', async () => {
  while (fs.existsSync('test-running.txt')) {
    await timers.setTimeout(25);
  }
});
