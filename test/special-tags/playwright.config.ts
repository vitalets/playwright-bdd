import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features'],
  steps: ['steps/*.ts'],
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
});
