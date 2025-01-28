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
      outputFile: 'actual-reports/index.html',
      externalAttachments: true,
      attachmentsBaseURL: process.env.ATTACHMENTS_BASE_URL,
    }),
  ],
  use: {
    video: 'on',
    screenshot: 'on',
    trace: 'on',
  },
});
