import { Page } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

class MyFixture {}

const test = base.extend<{ myFixture: MyFixture }>({
  myFixture: async ({}, use) => await use(new MyFixture()),
});

const { Given } = createBdd(test);

Given('some step', async ({ page, $tags, myFixture }) => {
  expectTypeOf($tags).toEqualTypeOf<string[]>();
  expectTypeOf(page).toEqualTypeOf<Page>();
  expectTypeOf(myFixture).toEqualTypeOf<MyFixture>();
});

/*
The following does not provide correct types:

const test = base.extend({});
const { Given } = createBdd(test);

But this is edge case and can be easily fixed with:
const test = base.extend<{}>({});
*/
