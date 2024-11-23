import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
  // features: 'features/pom.feature',
});

export default defineConfig({
  testDir,
});
