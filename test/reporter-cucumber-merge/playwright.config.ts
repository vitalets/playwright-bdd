import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import { testTimeout } from '../reporter-cucumber-html/timeout';

const testDir = defineBddConfig({
  featuresRoot: './features',
  steps: ['./features/**/*.ts', '!**/*.spec.ts'],
});

const isShardRun = process.argv.some((a) => a.startsWith('--shard'));

export default defineConfig({
  testDir,
  reporter: isShardRun
    ? 'blob'
    : [
        cucumberReporter('message', { outputFile: 'actual-reports/message.ndjson' }),
        cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
        ['../_helpers/rawJsonReporter.ts', { outputDir: 'actual-reports/raw-json' }],
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
