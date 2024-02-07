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
  fullyParallel: true,
  reporter: [
    cucumberReporter('message', { outputFile: 'reports/message.ndjson' }),
    cucumberReporter('junit', { outputFile: 'reports/report.xml', suiteName: 'My suite' }),
  ],
  use: {
    screenshot: 'only-on-failure',
  },
  expect: {
    timeout: 1,
  },
});
