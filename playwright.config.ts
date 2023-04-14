import { defineConfig } from '@playwright/test';

// using playwright for units tests :)

export default defineConfig({
  fullyParallel: true,
  projects: [
    {
      name: 'run-generated-tests',
      testDir: 'test/.features-gen',
      testMatch: ['**/*.spec.{ts,js}'],
    },
  ],
});
