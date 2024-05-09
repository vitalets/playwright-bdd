import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'success',
      testDir: defineBddConfig({
        outputDir: '.features-gen/success',
        paths: ['features/*.feature'],
        require: ['steps-pw-style/index.ts'],
        importTestFrom: 'steps-pw-style/fixtures.ts',
        tags: '@success',
      }),
    },
    {
      name: 'error',
      testDir: defineBddConfig({
        outputDir: '.features-gen/error',
        paths: ['features/*.feature'],
        require: ['steps-pw-style/index.ts'],
        importTestFrom: 'steps-pw-style/fixtures.ts',
        tags: '@error',
      }),
    },
  ],
});
