import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features'],
  require: ['steps/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'cucumber-report/report.html' })],
});
