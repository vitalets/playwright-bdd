import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  workers: 1, // set 1 worker for testing worker scoped fixtures
  projects: [
    {
      name: 'playwright-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/playwright-style',
        paths: ['features/*.feature'],
        require: ['steps/fixtures.ts', 'steps/steps-pw-style.ts'],
      }),
    },
    {
      name: 'cucumber-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/cucumber-style',
        paths: ['features/custom-fixtures*.feature'],
        require: ['steps/fixtures.ts', 'steps/steps-cucumber-style.ts'],
      }),
    },
  ],
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
});
