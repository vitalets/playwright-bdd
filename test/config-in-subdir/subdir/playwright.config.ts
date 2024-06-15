import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['.'],
  require: ['steps.ts'],
});

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
});
