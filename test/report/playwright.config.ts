import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'fixtures.ts',
  paths: ['*.feature'],
  require: ['steps.ts'],
});

export default defineConfig({
  testDir,
  // comment the line below to see console.log during debug of this test
  reporter: [['./reporter.ts']],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
