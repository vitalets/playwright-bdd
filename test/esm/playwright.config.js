import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        features: '*.feature',
        steps: 'steps/*.js',
      }),
    },
    {
      name: 'project two',
      dependencies: ['project one'],
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        features: 'project-two/*.feature',
        steps: ['steps/*.js', 'project-two/steps/*.js'],
      }),
    },
  ],
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
});
