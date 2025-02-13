import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
  workers: 1,
  reporter: [
    cucumberReporter('message', {
      outputFile: `actual-reports/report.jsonl`,
    }),
    cucumberReporter('html', {
      outputFile: `actual-reports/report.html`,
    }),
  ],
});
