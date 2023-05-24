import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig();

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
  reporter: 'html',
  // reporter: 'allure-playwright',
});
