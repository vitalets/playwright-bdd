import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'playwright',
      testDir: defineBddConfig({
        features: process.env.FEATURES || 'features/bdd-expressions.feature',
        tags: process.env.TAGS,
        missingSteps: process.env.MISSING_STEPS as 'fail-on-gen' | 'fail-on-run' | 'skip-scenario',
        steps: process.env.CUSTOM_PARAMETER_TYPES
          ? ['features/custom-parameter-types.steps.ts']
          : ['features/playwright.steps.ts', 'features/custom-type.steps.ts'],
        outputDir: '.features-gen/playwright',
        arityCheck: true,
      }),
    },
    {
      name: 'cucumber',
      testDir: defineBddConfig({
        features: process.env.FEATURES || 'features/bdd-expressions.feature',
        tags: process.env.TAGS,
        missingSteps: process.env.MISSING_STEPS as 'fail-on-gen' | 'fail-on-run' | 'skip-scenario',
        steps: process.env.CUSTOM_PARAMETER_TYPES
          ? ['features/custom-parameter-types.steps.ts']
          : ['features/cucumber.steps.ts', 'features/custom-type.steps.ts'],
        outputDir: '.features-gen/cucumber',
        arityCheck: true,
      }),
    },
  ],
  reporter: [cucumberReporter('message', { outputFile: 'actual-reports/messages.ndjson' })],
});
