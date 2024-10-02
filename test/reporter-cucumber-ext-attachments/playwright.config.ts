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
      // to view report with traces:
      // npx http-server test/reporter-cucumber-ext-attachments/actual-reports -o index.html
      attachmentsBaseURL: 'http://127.0.0.1:8080/data',
    }),
  ],
  use: {
    video: 'on',
    screenshot: 'on',
    trace: 'on',
  },
});
