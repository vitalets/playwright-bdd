import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: process.env.DIR,
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('json', { outputFile: `actual-reports/${process.env.DIR}/report.json` }),
    cucumberReporter('message', { outputFile: `actual-reports/${process.env.DIR}/report.jsonl` }),
    cucumberReporter('html', { outputFile: `actual-reports/${process.env.DIR}/report.html` }),
  ],
});
