import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['*.feature'],
  require: ['steps.ts'],
});

export default defineConfig({
  testDir,
  reporter: process.argv.includes('--shard')
    ? 'blob'
    : [cucumberReporter('html', { outputFile: 'reports/report.html' })],
});
