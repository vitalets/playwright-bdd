import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: `features/${process.env.FEATURE}.feature`,
  steps: 'features/*.ts',
  aiFix: {
    promptAttachment: true,
    promptTemplate: process.env.PROMPT_TEMPLATE,
  },
});

export default defineConfig({
  testDir,
  reporter: [
    ['html', { open: 'never', outputFolder: `actual-reports/${process.env.FEATURE}-pw` }],
    cucumberReporter('html', {
      outputFile: `actual-reports/${process.env.FEATURE}-cucumber/index.html`,
    }),
  ],
});
