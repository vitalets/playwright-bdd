import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

export default defineConfig({
  testDir: defineBddConfig({
    importTestFrom: './fixtures',
    paths: ['*.feature'],
    require: ['steps.ts'],
  }),
  workers: 1,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
