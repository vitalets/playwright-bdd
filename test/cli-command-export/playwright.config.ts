import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project1',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        features: ['features'],
        steps: ['steps/*.ts'],
      }),
    },
    {
      name: 'project2',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        features: ['features'],
        steps: ['steps/steps.ts', 'steps/steps2.ts'],
      }),
    },
  ],
});
