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
  // don't reduce test timeout as it produces unreliable errors
  timeout: process.platform === 'win32' ? 2000 : 1000,
  expect: {
    timeout: 1,
  },
});
