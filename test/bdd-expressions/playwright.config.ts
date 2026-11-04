import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'playwright',
      testDir: defineBddConfig({
        features: 'features/bdd-expressions.feature',
        steps: ['features/playwright.steps.ts', 'features/custom-type.steps.ts'],
        outputDir: '.features-gen/playwright',
        arityCheck: true,
      }),
    },
    {
      name: 'cucumber',
      testDir: defineBddConfig({
        features: 'features/bdd-expressions.feature',
        steps: ['features/cucumber.steps.ts', 'features/custom-type.steps.ts'],
        outputDir: '.features-gen/cucumber',
        arityCheck: true,
      }),
    },
  ],
  reporter: [cucumberReporter('message', { outputFile: 'actual-reports/messages.ndjson' })],
});
