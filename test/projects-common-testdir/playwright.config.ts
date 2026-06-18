import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: ['features/steps.ts'],
});

export default defineConfig({
  testDir,
  projects: [
    {
      name: 'setup',
      testDir: './features',
      testMatch: /setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
    },
  ],
});
