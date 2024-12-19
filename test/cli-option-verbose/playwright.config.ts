import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

const { PROJECTS = '' } = process.env;

export default defineConfig({
  projects: [
    ...(PROJECTS.includes('project1')
      ? [
          defineBddProject({
            name: 'project1',
            features: 'features/*.feature',
            steps: 'features/*.ts',
          }),
        ]
      : []),

    ...(PROJECTS.includes('project2')
      ? [
          defineBddProject({
            name: 'project2',
            features: 'features/*.feature',
            steps: 'features/*.ts',
          }),
        ]
      : []),
  ],
});
