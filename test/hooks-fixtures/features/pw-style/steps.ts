import { expect, Page } from '@playwright/test';
import { expectTypeOf } from 'expect-type';
import { Given, Before, After, BeforeAll, AfterAll } from './fixtures';

Before(async ({ $tags, $testInfo, page, someTestFixture, someWorkerFixture }) => {
  expect($tags).toEqual([]);
  expect($testInfo.title).toBeDefined();
  expect(page).toBeDefined();
  expect(someTestFixture).toEqual('someTestFixture');
  expect(someWorkerFixture).toEqual('someWorkerFixture');
  // types
  expectTypeOf($tags).toEqualTypeOf<string[]>();
  expectTypeOf(page).toEqualTypeOf<Page>();
  expectTypeOf(someTestFixture).toEqualTypeOf<string>();
  expectTypeOf(someWorkerFixture).toEqualTypeOf<string>();
});

After(async function ({ $tags, $testInfo, page, someTestFixture, someWorkerFixture }) {
  expect($tags).toEqual([]);
  expect($testInfo.title).toBeDefined();
  expect(page).toBeDefined();
  expect(someTestFixture).toEqual('someTestFixture');
  expect(someWorkerFixture).toEqual('someWorkerFixture');
});

BeforeAll(async ({ someWorkerFixture }) => {
  expect(someWorkerFixture).toEqual('someWorkerFixture');
});

AfterAll({}, async ({ someWorkerFixture }) => {
  expect(someWorkerFixture).toEqual('someWorkerFixture');
});

Given('State {int}', async ({ someTestFixture }) => {
  expect(someTestFixture).toEqual('someTestFixture');
});
