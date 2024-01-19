/**
 * Separate Playwright config to check HTML report.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  expect: { timeout: 500 },
  use: {
    screenshot: 'only-on-failure',
  },
});
