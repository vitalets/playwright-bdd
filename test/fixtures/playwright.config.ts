import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  workers: 1, // set 1 worker for testing worker scoped fixtures
  projects: [
    {
      name: 'playwright-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/playwright-style',
        importTestFrom: 'fixtures.ts',
        paths: ['*.feature'],
        require: ['steps.ts'],
      }),
    },
    {
      name: 'cucumber-style',
      testDir: defineBddConfig({
        outputDir: '.features-gen/cucumber-style',
        importTestFrom: 'fixtures.ts',
        paths: ['custom-fixtures*.feature'],
        require: ['steps-cucumber-style.ts'],
      }),
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
