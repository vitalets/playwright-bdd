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
        cucumberReporter('message', { outputFile: 'reports/message.ndjson' }),
        cucumberReporter('html', { outputFile: 'reports/report.html' }),
      ],
  use: {
    screenshot: 'only-on-failure',
  },
  expect: {
    timeout: 1,
  },
});
