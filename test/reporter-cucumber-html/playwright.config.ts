import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'features/fixtures.ts',
  paths: ['features/*.feature'],
  require: ['features/*.ts'],
  enrichReporterData: true,
});

export default defineConfig({
  testDir,
  reporter: [
    ['dot'],
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
