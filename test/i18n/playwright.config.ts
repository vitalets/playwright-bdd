import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  language: 'ru',
  paths: ['features/*.feature'],
  require: ['steps/*.ts'],
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
  reporter: [
    ['html'],
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
    ['./reporter.ts', { outputFile: 'actual-reports/report.txt' }],
  ],
});
