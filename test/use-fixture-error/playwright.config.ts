import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

export default defineConfig({
  testDir: defineBddConfig({
    paths: ['*.feature'],
    require: [process.env.STEPS || ''],
  }),
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
