import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  workers: 1, // set 1 worker for testing worker scoped fixtures
  projects: [
    {
      name: 'playwright-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/playwright-style',
        paths: ['features/*.feature'],
        importTestFrom: 'steps/fixtures.ts',
        require: ['steps/steps-pw-style.ts'],
      }),
    },
    {
      name: 'cucumber-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/cucumber-style',
        paths: ['features/custom-fixtures*.feature'],
        importTestFrom: 'steps/fixtures.ts',
        require: ['steps/steps-cucumber-style.ts'],
      }),
    },
  ],
});
