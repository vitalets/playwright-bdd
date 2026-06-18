import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: ['features/*.feature'],
  steps: ['steps/**/*.ts'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? 'blob' : 'list',
});
