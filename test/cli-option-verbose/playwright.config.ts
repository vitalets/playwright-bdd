import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  require: ['steps.ts'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
