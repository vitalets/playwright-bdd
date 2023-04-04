import { defineConfig } from '@playwright/test';

// using playwright for units tests :)

export default defineConfig({
  fullyParallel: true,
  projects: [
    {
      name: 'gen',
      testDir: 'test/gen',
      testMatch: '*.spec.ts',
    },
    {
      name: 'run',
      testDir: 'test/run',
      testMatch: '*.spec.ts',
    },
  ],
});
