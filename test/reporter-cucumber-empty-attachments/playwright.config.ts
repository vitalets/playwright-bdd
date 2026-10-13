import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('message', { outputFile: 'actual-reports/messages.ndjson' }),
    cucumberReporter('json', {
      outputFile: 'actual-reports/report.json',
      skipAttachments: false,
    }),
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
  ],
});
