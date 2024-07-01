import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: '.',
  steps: 'steps/*.ts',
});

export default defineConfig({
  testDir,
});
