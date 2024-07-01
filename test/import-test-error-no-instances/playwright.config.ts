import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: '.',
  // missing 'steps/fixtures.ts'
  steps: ['steps/steps.ts'],
});

export default defineConfig({
  testDir,
});
