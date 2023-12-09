import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        importTestFrom: 'fixtures.ts',
        paths: ['one/*.feature'],
        require: ['steps.ts'],
      }),
    },
    {
      name: 'project two',
      testDir: defineBddConfig({
        importTestFrom: 'fixtures.ts',
        paths: ['two/*.feature'],
        require: ['steps.ts'],
      }),
    },
  ],
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
