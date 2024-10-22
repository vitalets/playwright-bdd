import { defineConfig, Project } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

const PROJECT = process.env.PROJECT;

export default defineConfig({
  projects: [
    ...(PROJECT === 'success' ? [successProject()] : []),
    ...(PROJECT === 'fail' ? [failProject()] : []),
  ],
});

function successProject(): Project {
  return defineBddProject({
    name: 'success',
    featuresRoot: 'features/success',
    matchKeywords: true,
  });
}

function failProject(): Project {
  return defineBddProject({
    name: 'fail',
    featuresRoot: 'features/fail',
    matchKeywords: true,
  });
}
