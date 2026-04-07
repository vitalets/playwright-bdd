import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features'],
  require: ['features/steps.ts'],
});

export default defineConfig({
  testDir,
  retries: 1,
  // workers: 1 ensures scenario A runs first in worker 1 so that BeforeAll is
  // credited to A's result, not B's. Scenario B's attempt 0 then has no BeforeAll pwStep.
  workers: 1,
  reporter: [
    cucumberReporter('message', { outputFile: 'actual-reports/messages.ndjson' }),
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
  ],
});
