import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import { testTimeout } from '../reporter-cucumber-html/timeout';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
});

const isShardRun = process.argv.some((a) => a.startsWith('--shard'));

export default defineConfig({
  testDir,
  fullyParallel: true,
  reporter: isShardRun
    ? 'blob'
    : [
        cucumberReporter('message', { outputFile: 'actual-reports/message.ndjson' }),
        cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
      ],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  timeout: testTimeout,
  expect: {
    timeout: 1,
  },
});
