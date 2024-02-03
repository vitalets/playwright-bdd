import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: '../reporter-cucumber-html',
  importTestFrom: '../reporter-cucumber-html/features/fixtures.ts',
  paths: ['../reporter-cucumber-html/features/*.feature'],
  require: ['../reporter-cucumber-html/features/*.ts'],
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  reporter: process.argv.includes('--shard')
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
