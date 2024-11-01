import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('json', { outputFile: 'actual-reports/report.json' }),
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
  ],
});
