import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';
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
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
