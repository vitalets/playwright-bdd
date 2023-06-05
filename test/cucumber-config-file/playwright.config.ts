import { defineConfig } from '@playwright/test';
import { generateBDDTests } from '../../dist';

const testDir = generateBDDTests();

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
