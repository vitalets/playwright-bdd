import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../dist';

export default defineConfig({
  projects: [
    {
      name: 'project1',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        require: ['steps.ts'],
      }),
    },
    {
      name: 'project2',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        require: ['steps.ts', 'steps2.ts'],
      }),
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
