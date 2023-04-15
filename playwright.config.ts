import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  projects: [
    {
      name: 'unit-tests',
      testDir: 'test/.features-gen',
      testMatch: ['**/*.spec.{ts,js}'],
    },
  ],
});
