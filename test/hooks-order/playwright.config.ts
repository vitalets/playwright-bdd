import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

export default defineConfig({
  testDir: defineBddConfig({
    paths: ['*.feature'],
    require: ['steps.ts'],
  }),
  workers: 1,
  reporter: 'null',
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
