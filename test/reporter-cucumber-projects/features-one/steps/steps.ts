import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('State {int}', async ({ option }) => {
  expect(option).toEqual('foo');
});

Given('Fails for project {string}', async ({ $testInfo }, projectName: string) => {
  expect($testInfo.project.name).not.toEqual(projectName);
});
