import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  reporter: [
    cucumberReporter('message', { outputFile: 'actual-reports/messages.ndjson' }),
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
    cucumberReporter('json', {
      outputFile: 'actual-reports/report.json',
      addProjectToFeatureName: true,
      addMetadata: 'list',
    }),
    cucumberReporter('junit', {
      outputFile: 'actual-reports/report.xml',
      suiteName: 'my suite',
    }),
  ],
  projects: [
    {
      // see: https://github.com/vitalets/playwright-bdd/issues/143
      name: 'non-bdd-project',
      testMatch: /setup\.ts/,
      testDir: 'setup',
    },
    {
      name: 'project one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        paths: ['features-one/*.feature'],
        require: ['features-one/steps/*.ts'],
      }),
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'project one copy',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one-copy',
        paths: ['features-one/*.feature'],
        require: ['features-one/steps/*.ts'],
      }),
    },
    {
      name: 'project two',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        paths: ['features-two/*.feature'],
        require: ['features-two/*.ts'],
      }),
    },
  ],
});
