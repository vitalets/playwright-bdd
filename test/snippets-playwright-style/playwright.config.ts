import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

export default defineConfig({
  projects: [
    {
      testDir: defineBddConfig({
        outputDir: `.features-gen/two`,
        paths: ['two.feature'],
        require: ['steps.ts'],
      }),
    },
    {
      testDir: defineBddConfig({
        outputDir: `.features-gen/one`,
        paths: ['one.feature'],
        require: ['steps.ts'],
      }),
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
