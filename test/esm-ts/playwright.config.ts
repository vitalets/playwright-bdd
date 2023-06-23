/* eslint-disable @typescript-eslint/ban-ts-comment */
import { defineConfig } from '@playwright/test';
// @ts-ignore
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'fixtures.ts',
  paths: ['*.feature'],
  import: ['steps.ts'], // <- note 'import' instead of 'require'
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
