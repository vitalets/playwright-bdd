import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'success',
      testDir: defineBddConfig({
        outputDir: '.features-gen/success',
        paths: ['features/*.feature'],
        require: ['steps/index.ts'],
        importTestFrom: 'steps/fixtures.ts',
        tags: '@success',
      }),
    },
    {
      name: 'fail',
      testDir: defineBddConfig({
        outputDir: '.features-gen/fail',
        paths: ['features/*.feature'],
        require: ['steps/index.ts'],
        importTestFrom: 'steps/fixtures.ts',
        tags: '@fail',
      }),
    },
  ],
});
