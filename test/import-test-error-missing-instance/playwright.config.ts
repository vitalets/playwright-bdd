import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: '.',
  // missing 'steps/fixtures1.ts'
  steps: ['steps/steps.ts', 'steps/fixtures2.ts'],
});

export default defineConfig({
  testDir,
});
