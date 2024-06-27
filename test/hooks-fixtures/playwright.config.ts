import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  workers: 1,
  projects: [
    {
      name: 'hooks-fixtures-pw-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/pw-style',
        importTestFrom: 'pw-style/fixtures',
        paths: ['features/*.feature'],
        require: ['pw-style/steps.ts'],
      }),
    },
    {
      name: 'hooks-fixtures-cucumber-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/cucumber-style',
        importTestFrom: 'cucumber-style/fixtures',
        paths: ['features/*.feature'],
        require: ['cucumber-style/steps.ts'],
      }),
    },
  ],
});
