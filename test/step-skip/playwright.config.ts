import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const { FEATURE = '' } = process.env;

const testDir = defineBddConfig({
  featuresRoot: 'features',
  features: `features/${FEATURE}.feature`,
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('message', { outputFile: `actual-reports/${FEATURE}/messages.ndjson` }),
  ],
});
