import { Page } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

class MyFixture {}
class MyFixture2 {}

const test1 = base.extend<{ myFixture: MyFixture }>({
  myFixture: async ({}, use) => await use(new MyFixture()),
  page: async ({ baseURL, page }, use) => {
    await page.goto(baseURL);
    await use(page);
  },
});

const test2 = test1.extend<{ myFixture2: MyFixture2 }>({
  myFixture2: async ({}, use) => await use(new MyFixture2()),
});

const { Given } = createBdd(test2);

Given('some step', async ({ page, $tags, myFixture, myFixture2 }) => {
  expectTypeOf($tags).toEqualTypeOf<string[]>();
  expectTypeOf(page).toEqualTypeOf<Page>();
  expectTypeOf(myFixture).toEqualTypeOf<MyFixture>();
  expectTypeOf(myFixture2).toEqualTypeOf<MyFixture2>();
});

/*
The following does not provide correct types:

const test = base.extend({});
const { Given } = createBdd(test);

But this is edge case and can be fixed with:
const test = base.extend<object>({});
*/
