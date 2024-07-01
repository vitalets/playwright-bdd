import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project1',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        paths: ['features'],
        require: ['steps/*.ts'],
      }),
    },
    {
      name: 'project2',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        paths: ['features'],
        require: ['steps/steps.ts', 'steps/steps2.ts'],
      }),
    },
  ],
});
