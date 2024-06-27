import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        importTestFrom: 'steps/fixtures.js',
        features: '*.feature',
        steps: 'steps/index.js',
      }),
    },
    {
      name: 'project two',
      dependencies: ['project one'],
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        importTestFrom: 'project-two/steps/fixtures.js',
        features: 'project-two/*.feature',
        steps: ['steps/*.js', 'project-two/steps/*.js'],
      }),
    },
  ],
});
