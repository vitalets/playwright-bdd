import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project one',
      testDir: defineBddConfig({
        paths: ['one/*.feature'],
        require: ['*.ts'],
      }),
    },
    {
      name: 'project two',
      testDir: defineBddConfig({
        paths: ['two/*.feature'],
        require: ['*.ts'],
      }),
    },
  ],
});
