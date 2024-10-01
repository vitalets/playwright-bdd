import { Page, mergeTests, test as pwTest } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

class MyFixture {}
class MyFixture2 {}

const test1 = pwTest.extend<{ myFixture: MyFixture }>({
  myFixture: async ({}, use) => await use(new MyFixture()),
});

const test2 = base.extend<{ myFixture2: MyFixture2 }>({
  myFixture2: async ({}, use) => await use(new MyFixture2()),
});

const test = mergeTests(test1, test2);

const { Given } = createBdd(test);

Given('some step', async ({ page, $tags, myFixture, myFixture2 }) => {
  expectTypeOf($tags).toEqualTypeOf<string[]>();
  expectTypeOf(page).toEqualTypeOf<Page>();
  expectTypeOf(myFixture).toEqualTypeOf<MyFixture>();
  expectTypeOf(myFixture2).toEqualTypeOf<MyFixture2>();
});
