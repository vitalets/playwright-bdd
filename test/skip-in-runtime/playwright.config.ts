import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  require: ['features/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('json', { outputFile: 'actual-reports/report.json' })],
});
