import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    ['./reporter.ts', { outputFile: 'actual-reports/report.txt' }],
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
    ['html', { open: 'never' }],
  ],
});
