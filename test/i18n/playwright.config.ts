import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

const testDir = defineBddConfig({
  language: 'ru',
  paths: ['*.feature'],
  require: ['steps.ts'],
  requireModule: ['ts-node/register'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
