import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  require: ['features/*.ts'],
});

export default defineConfig({
  fullyParallel: true,
  reporter: [
    cucumberReporter('message', { outputFile: 'actual-reports/message.ndjson' }),
    cucumberReporter('junit', { outputFile: 'actual-reports/junit.xml', suiteName: 'My suite' }),
    cucumberReporter('junit-modern', {
      outputFile: 'actual-reports/junit-modern.xml',
      suiteName: 'My suite',
    }),
  ],
  use: {
    screenshot: 'only-on-failure',
  },
  expect: {
    timeout: 1,
  },
  projects: [
    {
      name: 'chromium',
      testDir,
    },
  ],
});
