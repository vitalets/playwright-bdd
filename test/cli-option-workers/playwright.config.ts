import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

export default defineConfig({
  projects: [
    defineBddProject({
      name: 'project1',
      featuresRoot: 'project1',
    }),
    defineBddProject({
      name: 'project2',
      featuresRoot: 'project2',
    }),
  ],
});
