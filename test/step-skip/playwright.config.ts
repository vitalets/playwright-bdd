import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  workers: 1,
  testDir: defineBddConfig({
    featuresRoot: 'features',
    features: `features/${process.env.FEATURE || 'success'}.feature`,
    steps: [
      'features/steps/fixtures.ts',
      'features/steps/steps.ts',
      'features/steps/before-hooks.ts',
      'features/steps/after-hooks.ts',
    ],
  }),
  reporter: [
    ['line'],
    cucumberReporter('message', { outputFile: 'actual-reports/messages.ndjson' }),
    cucumberReporter('json', { outputFile: 'actual-reports/cucumber.json' }),
    cucumberReporter('junit', { outputFile: 'actual-reports/cucumber.xml' }),
  ],
});
