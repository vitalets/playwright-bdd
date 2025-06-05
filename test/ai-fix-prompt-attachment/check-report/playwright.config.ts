/**
 * Separate Playwright config to check HTML report.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  reporter: 'dot',
  use: {
    actionTimeout: 3000,
    screenshot: { mode: 'only-on-failure', fullPage: true },
    viewport: { width: 800, height: 720 },
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  expect: { timeout: 500 },
});
