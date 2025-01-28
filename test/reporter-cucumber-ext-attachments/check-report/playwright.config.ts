/**
 * Separate Playwright config to check HTML report.
 */
import { defineConfig } from '@playwright/test';

const baseURL = `http://localhost:${process.env.PORT}`;

export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  reporter: 'dot',
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    viewport: { width: 800, height: 720 },
  },
  webServer: {
    command: `npx http-server actual-reports -c-1 -a localhost -p ${process.env.PORT}`,
    url: baseURL,
    cwd: process.cwd(),
  },
});
