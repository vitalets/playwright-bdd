import { defineConfig } from '@playwright/test';

// using playwright for units tests :)

export default defineConfig({
  fullyParallel: true,
  projects: [
    {
      name: 'gen',
      testDir: 'test/gen',
      testMatch: 'gen.spec.ts',
    },
    {
      name: 'run',
      testDir: 'test/run',
      testMatch: 'run.spec.ts',
    },
    {
      name: 'run-custom-world',
      testDir: 'test/run-custom-world',
      testMatch: 'index.spec.ts',
    },
  ],
});
