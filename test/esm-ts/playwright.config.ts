import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  reporter: [['./reporter.ts']],
  // for debug
  // reporter: 'html',
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        importTestFrom: 'steps/fixtures.ts',
        features: '*.feature',
        steps: 'steps/*.ts',
      }),
    },
    {
      name: 'project two',
      dependencies: ['project one'],
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        importTestFrom: 'project-two/steps/fixtures.ts',
        features: 'project-two/*.feature',
        steps: ['steps/*.ts', 'project-two/steps/*.ts'],
      }),
    },
  ],
});
