import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'features/fixtures.ts',
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
  // don't decrease this timeout as it's important for timeout tests
  timeout: 1500,
  expect: {
    timeout: 1,
  },
});
