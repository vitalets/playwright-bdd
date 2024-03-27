import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'variable',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        require: ['steps/steps1.ts'],
      }),
    },
    {
      name: 'template-literal',
      outputDir: '.features-gen/two',
      testDir: defineBddConfig({
        require: ['steps/steps2.ts'],
      }),
    },
  ],
});
