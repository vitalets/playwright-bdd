import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import { testTimeout } from '../reporter-cucumber-html/timeout';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  require: ['features/*.ts'],
  enrichReporterData: true,
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
  },
  timeout: testTimeout,
  expect: {
    timeout: 1,
  },
});
