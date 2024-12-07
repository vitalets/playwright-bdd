/**
 * Separate Playwright config to check HTML report.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  reporter: 'dot',
  use: {
    screenshot: 'only-on-failure',
    viewport: { width: 800, height: 720 },
  },
  expect: { timeout: 500 },
});
