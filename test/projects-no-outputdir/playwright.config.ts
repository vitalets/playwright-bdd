import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        features: ['one/*.feature'],
        steps: ['*.ts'],
      }),
    },
    {
      name: 'project two',
      testDir: defineBddConfig({
        features: ['two/*.feature'],
        steps: ['*.ts'],
      }),
    },
  ],
});
