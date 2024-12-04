import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const { ERROR } = process.env;

const testDir = defineBddConfig({
  featuresRoot: 'features',
  // outputDir is not defined, b/c it's the same for all tests
});

export default defineConfig({
  testDir,
  workers: 1,
  reporter: [
    cucumberReporter('message', { outputFile: `actual-reports/${ERROR}/report.jsonl` }),
    cucumberReporter('html', { outputFile: `actual-reports/${ERROR}/report.html` }),
    ['html', { open: 'never', outputFolder: `playwright-report/${ERROR}` }],
  ],
});
