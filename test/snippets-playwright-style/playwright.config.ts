import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      testDir: defineBddConfig({
        outputDir: `.features-gen/one`,
        paths: ['features/one.feature'],
        require: ['steps.ts'],
      }),
    },
    {
      testDir: defineBddConfig({
        outputDir: `.features-gen/two`,
        paths: ['features/two.feature'],
        require: ['steps.ts'],
      }),
    },
  ],
});
