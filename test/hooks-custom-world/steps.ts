import { expect } from '@playwright/test';
import { Given } from '@cucumber/cucumber';
import { createBdd } from 'playwright-bdd';
import { CustomWorld } from './world';
import { test } from './fixtures';

const { Before, After, BeforeAll, AfterAll } = createBdd(test, CustomWorld);

Before(async function ({ $bddWorld, $tags, $testInfo, page, myFixture }) {
  expect(this).toEqual($bddWorld);
  expect(this.foo).toEqual('bar');
  expect($tags).toEqual([]);
  expect($testInfo.title).toBeDefined();
  expect(page).toBeDefined();
  expect(myFixture).toEqual('myFixture');
});

After(async function ({ $bddWorld, $tags, $testInfo, page, myFixture }) {
  expect(this).toEqual($bddWorld);
  expect(this.foo).toEqual('bar');
  expect($tags).toEqual([]);
  expect($testInfo.title).toBeDefined();
  expect(page).toBeDefined();
  expect(myFixture).toEqual('myFixture');
});

BeforeAll(async function ({ myWorkerFixture }) {
  expect(myWorkerFixture).toEqual('myWorkerFixture');
});

AfterAll({}, async ({ myWorkerFixture }) => {
  expect(myWorkerFixture).toEqual('myWorkerFixture');
});

Given<CustomWorld>('State {int}', async function () {
  expect(this.foo).toEqual('bar');
});
