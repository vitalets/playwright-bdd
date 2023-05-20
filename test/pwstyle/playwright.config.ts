import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.features-gen',
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
