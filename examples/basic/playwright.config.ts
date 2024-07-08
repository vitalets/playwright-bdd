import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

// before playwright-bdd v7
const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  require: ['steps/*.ts'],
});

// since playwright-bdd v7
/*
const testDir = defineBddConfig({
  features: './features',
  steps: './steps',
});
*/

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'cucumber-report/report.html' })],
});
