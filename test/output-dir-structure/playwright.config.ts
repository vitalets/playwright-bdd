import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import path from 'node:path';

const testDir = defineBddConfig({
  features: [
    'features/root.feature',
    path.resolve('features/abs-path.feature'),
    'features/subdir/*.feature',
    'features/subdir/../rel-path.feature',
  ],
  steps: ['steps.ts'],
});

export default defineConfig({
  testDir,
});
