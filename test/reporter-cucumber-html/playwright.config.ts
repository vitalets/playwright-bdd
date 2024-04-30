import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'features/fixtures.ts',
  paths: ['features/*.feature'],
  require: ['features/*.ts'],
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  reporter: [
    ['line'],
    ['blob'],
    cucumberReporter('message', { outputFile: 'actual-reports/message.ndjson' }),
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
  ],
  use: {
    screenshot: 'only-on-failure',
  },
  // don't reduce test timeout as it produces unreliable errors
  timeout: 1500,
  expect: {
    timeout: 1,
  },
});
