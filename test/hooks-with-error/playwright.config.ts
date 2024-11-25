import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
  workers: 1,
  reporter: [
    cucumberReporter('message', { outputFile: `actual-reports/${process.env.ERROR}/report.jsonl` }),
    cucumberReporter('html', { outputFile: `actual-reports/${process.env.ERROR}/report.html` }),
  ],
});
