const { expect } = require('@playwright/test');
const { createBdd } = require('playwright-bdd');
const { test } = require('./fixtures');

const { Given } = createBdd(test);

Given('State {int}', async ({ foo, todoPage }) => {
  expect(foo).toEqual('bar');
  expect(todoPage).toBeDefined();
});
