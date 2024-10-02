import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
});

// before playwright-bdd v7
/*
const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  import: ['features/steps/*.ts'], // <- note 'import' instead of 'require'
});
*/

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('html', {
      outputFile: 'cucumber-report/index.html',
      externalAttachments: true,
      attachmentsBaseURL: 'http://127.0.0.1:8080/data',
    }),
  ],
  use: {
    screenshot: 'on',
    trace: 'on',
  },
});
