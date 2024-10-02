import { Page } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

const test = base.extend<object>({
  page: async ({ baseURL, page }, use) => {
    await page.goto(baseURL);
    await use(page);
  },
});

const { Given } = createBdd(test);

Given('some step', async ({ page, $tags }) => {
  expectTypeOf($tags).toEqualTypeOf<string[]>();
  expectTypeOf(page).toEqualTypeOf<Page>();
});

/*
The following does not provide correct types:

const test = base.extend({});
const { Given } = createBdd(test);

But this is edge case and can be easily fixed with:
const test = base.extend<{}>({});
*/
