import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: 'features',
});

export default defineConfig({
  testDir,
  workers: Number(process.env.WORKERS) || undefined,
});
