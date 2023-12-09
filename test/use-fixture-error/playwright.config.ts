import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  testDir: defineBddConfig({
    paths: ['*.feature'],
    require: [process.env.STEPS || ''],
  }),
});
