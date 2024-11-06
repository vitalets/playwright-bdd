import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
  // features: 'features/tagged-scenario-baz.feature',
});

export default defineConfig({
  testDir,
});
