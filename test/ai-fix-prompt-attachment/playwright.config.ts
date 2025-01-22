import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
  aiFix: {
    promptAttachment: true,
    promptTemplate: process.env.PROMPT_TEMPLATE,
  },
});

export default defineConfig({
  testDir,
  reporter: [
    ['html', { open: 'never' }],
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
  ],
});
