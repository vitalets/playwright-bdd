# Playwright-style steps
Playwright-style allows you to write step definitions like a regular playwright tests.
You get all benefits of [built-in fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures) as well as [custom fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures).

Playwright-style highlights:

* use `Given`, `When`, `Then` from `createBdd()` call (see example below)
* use arrow functions for step definitions
* don't use `World` and `before/after` hooks (use fixtures instead)

Example:

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

> Usually step functions are async, but it is not required

## Fixtures
To use [fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures) in step definitions:

1. Define fixtures with `.extend()` and export `test` instance. For example, `fixtures.ts`:
    ```ts
    // Note: import base from playwright-bdd, not from @playwright/test!
    import { test as base } from 'playwright-bdd';

    // custom fixture
    class MyPage {
      constructor(public page: Page) {}

      async openLink(name: string) {
        await this.page.getByRole('link', { name }).click();
      }
    }

    // export custom test function
    export const test = base.extend<{ myPage: MyPage }>({
      myPage: async ({ page }, use) => {
        await use(new MyPage(page));
      }
    });
    ```
2. Pass custom `test` function to `createBdd()` and use fixtures in step definitions. For example, `steps.ts`:
    ```ts
    import { createBdd } from 'playwright-bdd';
    import { test } from './fixtures';

    const { Given, When, Then } = createBdd(test);

    Given('I open url {string}', async ({ myPage }, url: string) => { ... });
    When('I click link {string}', async ({ myPage }, name: string) => { ... });
    Then('I see in title {string}', async ({ myPage }, text: string) => { ... });
    ```

3. Set config option `importTestFrom` which points to file exporting custom `test` function. 
   For example: 
    ```js
    const testDir = defineBddConfig({
      importTestFrom: './fixtures.ts',
      // ...
    });
    ```
   Generated files, before and after: 
    ```diff
    -import { test } from "playwright-bdd";  
    +import { test } from "./fixtures.ts";  
    ```

See [full example of Playwright-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/basic).

## Accessing `test` and `testInfo`
You can access [`test`](https://playwright.dev/docs/api/class-test) and [`testInfo`](https://playwright.dev/docs/api/class-testinfo) in step body using special fixtures `$test` and `$testInfo` respectively. It allows to:

  * increase test timeout
  * conditionally skip tests
  * attach screenshots
  * ...etc

Example - skip test for `firefox`:
```ts
Given('I do something', async ({ browserName, $test }) => { 
  if (browserName === 'firefox') $test.skip();
  // ...
});
```

## Using tags
You can access [Cucumber tags](https://cucumber.io/docs/cucumber/api/?lang=javascript#tags) in step definitions by special `$tags` fixture:

```gherkin
@slow
Feature: Playwright site
    
    @jira:123
    Scenario: Check title
      Given I do something
      ...
```
In step definition:
```ts
Given('I do something', async ({ $tags }) => {
  console.log($tags); // outputs ["@slow", "@jira:123"]
});
```

The most powerful usage of `$tags` is in your custom fixtures.

##### Example 1
Run scenario only in Firefox if it has `@firefox` tag:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ firefoxOnly: void }>({
  firefoxOnly: [async ({ $tags }, use, testInfo) => {
    if ($tags.includes('@firefox')) {
      testInfo.skip();
    }
    await use();
  }, { auto: true }],
});
```

##### Example 2
Overwrite locale to `fi` if test has a `@LocaleFi` tag:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  locale: async ({ $tags, locale }, use) => {
    if ($tags.includes('@LocaleFi')) {
      locale = 'fi';
    }
    await use(locale);
  },
});
```

##### Example 3
Overwrite `viewport` for scenarios with `@mobile` tag:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  viewport: async ({ $tags, viewport }, use) => {
    if ($tags.includes('@mobile')) {
      viewport = { width: 375, height: 667 };
    }
    await use(viewport);
  }
});
```

### Playwright tags
Please note, that **Cucumber tags are not automatically appended to the test title** for Playwright. 
This is done intentionally to keep test titles unchanged. Waiting for Playwright tags API, see [microsoft/playwright#23180](https://github.com/microsoft/playwright/issues/23180).

If you need [Playwright tags](https://playwright.dev/docs/test-annotations#tag-tests) you can manually append them to feature/scenario name:
```gherkin
Feature: Playwright site @desktop
    
    Scenario: Check title @slow
      ...
```
And then run with Playwright option [`--grep`](https://playwright.dev/docs/test-annotations#tag-tests):
```
npx bddgen && npx playwright test --grep @desktop
```

## Using `DataTables`
Playwright-bdd provides full support of [`DataTables`](https://cucumber.io/docs/gherkin/reference/#data-tables).
For example:
```gherkin
Feature: Some feature

    Scenario: Login
        When I fill login form with values
          | label     | value    |
          | Username  | vitalets |
          | Password  | 12345    |
```

Step definition:
```ts
import { createBdd } from 'playwright-bdd';
import { DataTable } from '@cucumber/cucumber';

const { Given, When, Then } = createBdd();

When('I fill login form with values', async ({ page }, data: DataTable) => {
  for (const row of data.hashes()) {
    await page.getByLabel(row.label).fill(row.value);
  }
  /*
  data.hashes() returns:
  [
    { label: 'Username', value: 'vitalets' },
    { label: 'Password', value: '12345' }
  ]
  */
});
```
Check out all [methods of DataTable](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/data_table_interface.md) in Cucumber docs.