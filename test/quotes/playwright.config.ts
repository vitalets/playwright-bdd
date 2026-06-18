import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'single-quotes',
      testDir: defineBddConfig({
        quotes: 'single',
        outputDir: `.features-gen/single`,
        features: ['*.feature'],
        steps: ['steps.ts'],
      }),
    },
    {
      name: 'double-quotes',
      testDir: defineBddConfig({
        quotes: 'double',
        outputDir: `.features-gen/double`,
        features: ['*.feature'],
        steps: ['steps.ts'],
      }),
    },
    {
      name: 'backtick-quotes',
      testDir: defineBddConfig({
        quotes: 'backtick',
        outputDir: `.features-gen/backtick`,
        features: ['*.feature'],
        steps: ['steps.ts'],
      }),
    },
  ],
});
