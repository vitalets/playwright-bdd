import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/*.feature'],
  require: ['steps/**/*.ts'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? 'blob' : 'list',
});
