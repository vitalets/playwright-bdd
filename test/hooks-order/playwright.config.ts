import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
  workers: 1,
  reporter: 'list', // reporter list is important to pass tests on CI
});
