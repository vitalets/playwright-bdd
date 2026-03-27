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
    cucumberReporter('junit', {
      outputFile: 'actual-reports/junit-playwright.xml',
      suiteName: 'My suite',
      nameFormat: 'playwright',
    }),
  ],
  use: {
    screenshot: { mode: 'only-on-failure', fullPage: true },
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
