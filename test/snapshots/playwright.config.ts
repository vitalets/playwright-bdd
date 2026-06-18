import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['*.feature'],
  steps: ['steps.ts'],
});

export default defineConfig({
  testDir,
  reporter: [['html', { open: 'never' }]],
});
