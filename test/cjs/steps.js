const { expect } = require('@playwright/test');
const { createBdd } = require('playwright-bdd');
const { test } = require('./fixtures');

const { Given } = createBdd(test);

Given('State {int}', async ({ page, foo }) => {
  expect(page).toBeDefined();
  expect(foo).toEqual('bar');
});
