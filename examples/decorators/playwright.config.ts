import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

// before playwright-bdd v7
const testDir = defineBddConfig({
  paths: ['features'],
  importTestFrom: 'features/steps/fixtures.ts',
});

// since playwright-bdd v7
/*
const testDir = defineBddConfig({
  features: 'features',
  steps: 'features/steps/*.ts',
});
*/

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'cucumber-report/report.html' })],
  timeout: 10 * 1000,
});
