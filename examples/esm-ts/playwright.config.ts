import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.features-gen',
  projects: [{ name: 'e2e' }],
});
