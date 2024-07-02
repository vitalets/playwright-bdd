import { expect } from '@playwright/test';
import { Given } from './fixtures';

Given('bdd world is defined', async function () {
  expect(this.page).toBeDefined();
  expect(this.testInfo.title).toEqual('scenario');
  expect(this.step.title).toEqual('bdd world is defined');
});
