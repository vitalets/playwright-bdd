import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: './features',
  aiFix: {
    promptAttachment: true,
  },
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('html', {
      outputFile: 'cucumber-report/index.html',
    }),
    ['html', { open: 'never' }],
  ],
  use: {
    screenshot: 'only-on-failure',
  },
});
