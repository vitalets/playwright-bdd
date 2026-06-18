import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: ['features/*.ts'],
});

export default defineConfig({
  reporter: [cucumberReporter('json', { outputFile: 'actual-reports/json-report.json' })],
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
