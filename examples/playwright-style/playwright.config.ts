import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  paths: ['features'],
  require: ['steps/*.ts'],
  quotes: 'backtick',
});

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'cucumber-report/report.html' })],
});
