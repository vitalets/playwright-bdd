import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: process.env.FEATURES || 'features/sample.feature',
  steps: 'features/*.ts',
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
