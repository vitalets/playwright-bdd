import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  projects: [
    { name: 'generated-tests', testDir: 'test/.features-gen' },
    { name: 'custom-world', testDir: 'test/custom-world' },
    { name: 'parse-error', testDir: 'test/parse-error' },
  ],
});
