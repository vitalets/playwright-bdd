import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  import: ['steps/*.ts'], // <- note 'import' instead of 'require'
});

export default defineConfig({
  testDir,
  reporter: [cucumberReporter('html', { outputFile: 'cucumber-report/report.html' })],
});
