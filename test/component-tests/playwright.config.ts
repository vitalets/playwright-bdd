import { defineConfig } from '@playwright/experimental-ct-react';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: process.env.NATIVE_MERGE_TESTS
    ? 'steps-native/fixtures.js'
    : 'steps-polyfill/fixtures.ts',
  paths: ['features'],
  require: process.env.NATIVE_MERGE_TESTS
    ? ['steps-native/steps.jsx']
    : ['steps-polyfill/steps.tsx'],
});

export default defineConfig({
  testDir,
  timeout: 5 * 1000,
  use: {
    screenshot: 'only-on-failure',
  },
});
