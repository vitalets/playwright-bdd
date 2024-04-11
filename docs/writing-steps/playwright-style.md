# Playwright-style steps
Playwright-style allows you to write step definitions like regular Playwright tests.
You get all benefits of [built-in fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures) as well as [custom fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures).

Playwright-style highlights:

* use `Given`, `When`, `Then` from `createBdd()` call (see example below)
* use arrow functions for step definitions
* don't use `World` / `this` inside steps

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

?> Calling `const { Given, When, Then } = createBdd()` at the top of each step file is normal, because it returns lightweight wrappers without heavy operations

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

## Accessing `$step`
You can access current step info by special `$step` fixture.
Currently, it contains only step title, but can be extended in the future.

One of the use-cases - additional matching in the step title.
Imagine you have a step that checks element visibility: 
`Then('element with text {string} should( not) be displayed', ...)`.
As optional matches are [not a part](https://github.com/cucumber/cucumber-expressions/issues/125) of Cucumber expression result,
the easiest way to check for `( not)` is to use step title: 
```ts
Then('element with text {string} should( not) be displayed', async ({ page, $step }, text: string) => {
  const negate = /should not/.test($step.title);
  if (negate) {
    await expect(page.getByText(text)).toBeHidden();
  } else {
    await expect(page.getByText(text)).toBeVisible();
  }
});
```

## Tags
You can access tags in step definitions by special `$tags` fixture:

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
```gherkin
Feature: some feature
    
    @firefox
    Scenario: Runs only in Firefox
      ...
```
Custom fixture:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ firefoxOnly: void }>({
  firefoxOnly: [async ({ $tags }, use, testInfo) => {
    if ($tags.includes('@firefox')) testInfo.skip();
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

## Call step from step
Sometimes it is useful to call one step from another, to share common functionality.
Playwright-bdd provides a way to do it without defining any extra helpers.
Save the result of `Given() / When() / Then()` to variable and invoke it in other steps.
Note that you should pass all required fixtures in the first argument.

Example:
```ts
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

const createTodo = When('I create todo {string}', async ({ page }, text: string) => {
  await page.getByLabel('title').fill(text);
  await page.getByRole('button').click();
});

When(
  'I create 2 todos {string} and {string}',
  async ({ page }, text1: string, text2: string) => {
    await createTodo({ page }, text1);
    await createTodo({ page }, text2);
  },
);
```