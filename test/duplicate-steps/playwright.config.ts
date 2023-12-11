import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'no duplicate steps',
      testDir: defineBddConfig({
        outputDir: `.features-gen/one`,
        paths: ['features/one.feature'],
        importTestFrom: 'steps/fixtures.ts',
      }),
    },
    {
      // important to have duplicate steps in the second project
      // that runs in a worker process
      name: 'duplicates',
      testDir: defineBddConfig({
        outputDir: `.features-gen/two`,
        paths: ['features/two.feature'],
        importTestFrom: 'steps/fixtures.ts',
      }),
    },
  ],
});
