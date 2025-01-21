/**
 * Separate Playwright config to check HTML report.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../features',
  // testDir: '../features/background',
  outputDir: './test-results',
  reporter: 'dot',
  timeout: 5000,
  use: {
    screenshot: 'only-on-failure',
    viewport: { width: 800, height: 720 },
  },
  expect: { timeout: 500 },
});
