import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  workers: 1,
  projects: [
    {
      name: 'hooks-fixtures-pw-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/pw-style',
        paths: ['features/*.feature'],
        require: ['pw-style/*.ts'],
      }),
    },
    {
      name: 'hooks-fixtures-cucumber-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/cucumber-style',
        paths: ['features/*.feature'],
        require: ['cucumber-style/*.ts'],
      }),
    },
  ],
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
});
