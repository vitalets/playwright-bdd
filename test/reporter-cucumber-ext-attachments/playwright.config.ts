import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('html', {
      outputFile: 'actual-reports/report.html',
      externalAttachments: true,
    }),
  ],
  use: {
    video: 'on',
    screenshot: 'on',
    trace: 'on',
  },
});
