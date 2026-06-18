import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: 'steps/*',
});

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
});
