import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('message', {
      outputFile: 'actual-reports/no-attachments.ndjson',
      skipAttachments: true,
    }),
    cucumberReporter('json', {
      outputFile: 'actual-reports/no-attachments.json',
      skipAttachments: true,
    }),
    cucumberReporter('json', {
      outputFile: 'actual-reports/filter-attachments.json',
      // skip screenshots, video, trace and a custom type
      skipAttachments: ['image/png', 'video/webm', 'application/zip', 'x-ignored-type'],
    }),
    cucumberReporter('html', {
      outputFile: 'actual-reports/filter-attachments.html',
      // skip screenshots, video, trace and a custom type
      skipAttachments: ['image/png', 'video/webm', 'application/zip', 'x-ignored-type'],
    }),
    // no junit here, b/c junit does not save store attachments in xml
    // (although it collects them)
  ],
  use: {
    video: 'on',
    screenshot: 'on',
    trace: 'on',
  },
});
