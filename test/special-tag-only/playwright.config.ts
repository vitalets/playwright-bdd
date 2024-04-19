import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features'],
  require: ['steps/*.ts'],
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
});
