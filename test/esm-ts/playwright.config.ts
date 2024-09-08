import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

export default defineConfig({
  reporter: [
    ['./reporter.ts'],
    cucumberReporter('html', { outputFile: 'actual-reports/report.html' }),
  ],
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        features: '*.feature',
        steps: 'steps/*.ts',
      }),
    },
    {
      name: 'project two',
      dependencies: ['project one'],
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        features: 'project-two/*.feature',
        steps: ['steps/*.ts', 'project-two/steps/*.ts'],
      }),
    },
  ],
});
