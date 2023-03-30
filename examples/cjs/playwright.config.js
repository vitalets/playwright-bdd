import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.features-gen',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
