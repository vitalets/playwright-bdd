import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'pw-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/pw-style',
        features: 'features',
        steps: 'steps-pw-style/*.ts',
        quotes: 'double',
      }),
    },
    {
      name: 'cucumber-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/cucumber-style',
        features: 'features',
        steps: 'steps-cucumber-style/*.ts',
        quotes: 'double',
      }),
    },
  ],
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
});
