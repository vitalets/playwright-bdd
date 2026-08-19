import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: '.features-gen',
      testDir: defineBddConfig({
        featuresRoot: './features',
        outputDir: '.features-gen',
        lockFile: process.env.LOCK_FILE === 'true',
      }),
    },
    ...(process.env.EXTRA_NO_LOCK_PROJECT
      ? [
          {
            name: '.features-gen-not-locked',
            testDir: defineBddConfig({
              featuresRoot: './features',
              outputDir: '.features-gen-not-locked',
              lockFile: false,
            }),
          },
        ]
      : []),
  ],
});
