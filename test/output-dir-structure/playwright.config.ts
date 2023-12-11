import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import path from 'node:path';

const testDir = defineBddConfig({
  paths: [
    'features/root.feature',
    path.resolve('features/abs-path.feature'),
    'features/subdir/*.feature',
    'features/subdir/../rel-path.feature',
  ],
  require: ['steps.ts'],
});

export default defineConfig({
  testDir,
});
