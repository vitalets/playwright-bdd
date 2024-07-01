import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['*.feature'],
  require: ['steps/*.ts'],
});

export default defineConfig({
  testDir,
});
