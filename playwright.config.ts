import { defineConfig } from '@playwright/test';

// using playwright for units tests :)

export default defineConfig({
  testDir: 'test/gen',
  testMatch: 'gen.spec.ts',
  projects: [{ name: 'unit' }],
});
