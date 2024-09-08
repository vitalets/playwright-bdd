import { defineConfig } from '@playwright/experimental-ct-react';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features'],
  require: process.env.NATIVE_MERGE_TESTS
    ? ['steps-native/*.{js,jsx}']
    : ['steps-polyfill/*.{ts,tsx}'],
});

export default defineConfig({
  testDir,
  timeout: 5 * 1000,
  use: {
    screenshot: 'only-on-failure',
  },
  reporter: [cucumberReporter('html', { outputFile: 'actual-reports/report.html' })],
});
