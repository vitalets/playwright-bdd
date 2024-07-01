import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['*.feature'],
  steps: 'steps.ts', // missing 'fixtures.ts'!
});

export default defineConfig({
  testDir,
});
