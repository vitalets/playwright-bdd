import { expect } from '@playwright/test';
import { Given, Before, After, BeforeAll, AfterAll } from './fixtures';

Before(async function ({ $tags, $testInfo, page, someTestFixture, someWorkerFixture }) {
  expect(this.foo).toEqual('bar');
  expect($tags).toEqual([]);
  expect($testInfo.title).toBeDefined();
  expect(page).toBeDefined();
  expect(someTestFixture).toEqual('someTestFixture');
  expect(someWorkerFixture).toEqual('someWorkerFixture');
});

After(async function ({ $tags, $testInfo, page, someTestFixture, someWorkerFixture }) {
  expect(this.foo).toEqual('bar');
  expect($tags).toEqual([]);
  expect($testInfo.title).toBeDefined();
  expect(page).toBeDefined();
  expect(someTestFixture).toEqual('someTestFixture');
  expect(someWorkerFixture).toEqual('someWorkerFixture');
});

BeforeAll(async function ({ someWorkerFixture }) {
  expect(someWorkerFixture).toEqual('someWorkerFixture');
});

AfterAll({}, async ({ someWorkerFixture }) => {
  expect(someWorkerFixture).toEqual('someWorkerFixture');
});

Given('State {int}', async function () {
  expect(this.foo).toEqual('bar');
});
