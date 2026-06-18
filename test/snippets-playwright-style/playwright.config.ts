import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      testDir: defineBddConfig({
        outputDir: `.features-gen/one`,
        features: ['features/one.feature'],
        steps: ['steps.ts'],
      }),
    },
    {
      testDir: defineBddConfig({
        outputDir: `.features-gen/two`,
        features: ['features/two.feature'],
        steps: ['steps.ts'],
      }),
    },
  ],
});
