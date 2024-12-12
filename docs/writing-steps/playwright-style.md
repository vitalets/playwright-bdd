# Playwright-style steps
Playwright-style allows you to write step definitions like a regular Playwright tests.

* step definitions accept custom fixtures as a first argument, and the rest are step parameters
* step definitions don't use World (`this`)
* step definitions can (and should) be defined as arrow functions

To produce `Given / When / Then` for playwright-style with default fixtures, call `createBdd()` without any arguments:

```ts
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I open url {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

When('I click link {string}', async ({ page }, name: string) => {
  await page.getByRole('link', { name }).click();
});
```

> Usually step functions are async, but they can be synchronous as well

See [full example of Playwright-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/basic-cjs).

## Custom fixtures
You can use [custom fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures) in step definitions.

1. First you should extend base test from `playwright-bdd` with custom fixtures:
    ```ts
    // fixtures.ts
    // Note: import base from playwright-bdd, not from @playwright/test!
    import { test as base } from 'playwright-bdd';

    export const test = base.extend<{ myFixture: MyFixture }>({
      myFixture: async ({ page }, use) => {
        await use(new MyFixture(page));
      }
    });
    ```
  > Make sure to **export** test instance, because it is used in the generated files

2. From the same file you can export `Given / When / Then` bound to custom `test`:
    ```ts
    // fixtures.ts
    // Note: import base from playwright-bdd, not from @playwright/test!
    import { test as base } from 'playwright-bdd';

    export const test = base.extend<{ myFixture: MyFixture }>({
      myFixture: async ({ page }, use) => {
        await use(new MyFixture(page));
      }
    });

    export const { Given, When, Then } = createBdd(test); // <- export Given, When, Then
    ```

3. Use these `Given / When / Then` to define steps:
    ```ts
    // steps.ts
    import { createBdd } from 'playwright-bdd';
    import { Given, When, Then } from './fixtures';

    Given('I open url {string}', async ({ myFixture }, url: string) => { 
      // ... 
    });
    ```

!> For TypeScript users: if you overwrite **only built-in** Playwright fixtures, you should pass `object` as a generic type parameter to `test.extend<object>()` to get proper typings.

For example, if you overwrite only built-in `page` fixture:
```ts
// not valid: 
// export const test = base.extend({ ... });

export const test = base.extend<object>({  // <- notice <object> param
  page: async ({ baseURL, page }, use) => {
    await page.goto(baseURL);
    await use(page);
  },
});
```
