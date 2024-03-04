import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  reporter: [
    cucumberReporter('message', { outputFile: 'reports/messages.ndjson' }),
    cucumberReporter('html', { outputFile: 'reports/report.html' }),
    cucumberReporter('json', {
      outputFile: 'reports/report.json',
      addProjectToFeatureName: true,
      addMetadata: 'list',
    }),
  ],
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        importTestFrom: 'features-one/steps/fixtures.ts',
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
        importTestFrom: 'features-one/steps/fixtures.ts',
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
