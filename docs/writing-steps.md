# Writing steps
There are two ways of writing step definitions:
1. **Playwright-style** - recommended for new projects or adding BDD to existing Playwright projects
2. **Cucumber-style** - recommended for migrating existing CucumberJS projects to Playwright runner

## Playwright-style
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

### Custom fixtures
To use [custom fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures) in step definitions:

1. Define custom fixtures with `.extend()` and export `test` instance. For example, `fixtures.ts`:
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
2. Pass custom `test` function to `createBdd()` and use customs fixtures in step definitions. For example, `steps.ts`:
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

See [full example of Playwright-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/playwright-style).

### Accessing `test` and `testInfo`
You can access [`test`](https://playwright.dev/docs/api/class-test) and [`testInfo`](https://playwright.dev/docs/api/class-testinfo) in step body using special fixtures `$test` and `$testInfo` respectively. It allows to:

  * increate test timeout
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

### Using tags
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

> Special tags `@only`, `@skip` and `@fixme` are excluded from `$tags` to avoid impact on test during debug

The most powerfull usage of `$tags` is in your custom fixtures.

**Example 1** - run scenarios with `@firefox` tag only in Firefox:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ browserSpecificTest: void }>({
  browserSpecificTest: [async ({ $tags }, use, testInfo) => {
    if ($tags.includes('@firefox') && testInfo.project.name !== 'firefox') {
      testInfo.skip();
    }
    await use();
  }, { auto: true }],
});
```

**Example 2** - overwrite `viewport` for scenarios with `@mobile` tag:
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

Please note, that **Cucumber tags are not automatically appended to test title** for Playwright. 
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

### Using `DataTables`
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

## Cucumber-style
Cucumber-style step definitions are compatible with CucumberJS:

* import `Given`, `When`, `Then` from `@cucumber/cucumber` package
* [use regular functions for steps](https://github.com/cucumber/cucumber-js/blob/main/docs/faq.md#the-world-instance-isnt-available-in-my-hooks-or-step-definitions) (not arrow functions!) 
* use `BddWorld` from `playwright-bdd` to access Playwright API 

Example (TypeScript):

```ts
import { Given, When, Then } from '@cucumber/cucumber';
import { BddWorld } from 'playwright-bdd';
import { expect } from '@playwright/test';

Given<BddWorld>('I open url {string}', async function (url: string) {
  await this.page.goto(url);
});

When<BddWorld>('I click link {string}', async function (name: string) {
  await this.page.getByRole('link', { name }).click();
});

Then<BddWorld>('I see in title {string}', async function (keyword: string) {
  await expect(this.page).toHaveTitle(new RegExp(keyword));
});
```

### World
Playwright-bdd provides `BddWorld` extending [Cucumber World](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md) with Playwright [built-in fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures) and [testInfo](https://playwright.dev/docs/test-advanced#testinfo-object). Simply use `this.page` or `this.testInfo` in step definitions:

```js
import { Given, When, Then } from '@cucumber/cucumber';

Given('I open url {string}', async function (url) {
  console.log(this.testInfo.title);
  await this.page.goto(url);
});
```

In TypeScript you should import `BddWorld` type from `playwright-bdd` for proper typing:
```ts
import { Given, When, Then } from '@cucumber/cucumber';
import { BddWorld } from 'playwright-bdd';

Given<BddWorld>('I open url {string}', async function (url: string) {
  await this.page.goto(url);
});
```

Check out [all available props of BddWorld](https://github.com/vitalets/playwright-bdd/blob/main/src/run/bddWorld.ts). 

### Custom World
To use Custom World you should inherit it from `BddWorld` and pass to Cucumber's `setWorldConstructor`:

```ts
import { setWorldConstructor } from '@cucumber/cucumber';
import { BddWorld, BddWorldOptions } from 'playwright-bdd';

export class CustomWorld extends BddWorld {
  myBaseUrl: string;
  constructor(options: BddWorldOptions) {
    super(options);
    this.myBaseUrl = 'https://playwright.dev';
  }

  async init() {
    await this.page.goto(this.myBaseUrl);
  }
}

setWorldConstructor(CustomWorld);
```
> Consider asynchronous setup and teardown of `BddWorld` using `init()` / `destroy()` methods.

See [full example of Cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).

### Custom fixtures
Along with built-in fixtures you can use any custom fixture in cucumber-style steps.
To get fixture call `this.useFixture(fixtureName)` method inside step body.

For example:
```js
When('I open todo page', async function () {
  const todoPage = this.useFixture('todoPage');
  await todoPage.open();
});
```

For **TypeScript** you can pass `typeof test` as a second generic parameter to `BddWorld`:

```ts
type MyWorld = BddWorld<object, typeof test>;

When<MyWorld>('I open todo page', async function () {
  const todoPage = this.useFixture('todoPage');
  await todoPage.open();
});
```

> Please note that **you can only pass static strings** to `this.useFixture()`. Function body is analyzed to find used fixtures. Below **will not work**:
```ts
// will not work!
const fixtureName = 'todoPage';
const todoPage = this.useFixture(fixtureName);
```

## Hooks

Hooks are functions that run before/after some parts of test execution.

> Please note that Playwright offers concept of [fixtures](https://playwright.dev/docs/test-fixtures#introduction). In most cases fixtures is a better alternative to hooks, can fully replace them and provide [a lot of advantages](https://playwright.dev/docs/test-fixtures#with-fixtures). By default always consider to use fixtures.

If you still need to use hooks, there are 3 cases:

1. to run code before/after **overall test execution** - use Playwright's [global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown)
2. to run code before/after **every worker** - use `BeforeAll` / `AfterAll` hooks
3. to run code before/after **every scenario** - use `Before` / `After` hooks

Playwright-bdd supports all types of hooks.

<details>
<summary>Internally hooks are implemented via fixtures. Expand to learn more.</summary>

Here is the base code to demonstrate how hooks relate to fixtures:
```ts
export const testWithHooks = base.extend<
  { scenarioHooks: void },
  { workerHooks: void }
>({
  scenarioHooks: [async ({}, use) => {
    // run Before hooks
    await use();
    // run After hooks
  }, { auto: true }],
  workerHooks: [async ({}, use) => {
    // run BeforeAll hooks
    await use();
    // run AfterAll hooks
  }, { auto: true, scope: 'worker' }],
});
```
You can re-use this snippet in your project to get full control over hooks.

</details>

Example of hooks:
```ts
import { BeforeAll, AfterAll, Before, After } from 'playwright-bdd';

BeforeAll(async () => {
  console.log('run before all scenarios inside worker');
});

AfterAll(async () => {
  console.log('run after all scenarios inside worker');
});

Before(async () => {
  console.log('run before each scenario');
});

After(async () => {
  console.log('run after each scenario');
});
```

For **cucumber-style**, I you need to access **World** as `this` in `Before / After` hooks, you should use regular functions instead of arrows:
```ts
Before(async function () {
  console.log('before', this.page.url());
});

After(async function () {
  console.log('after', this.page.url());
});
```

Hooks accept built-in fixtures as a first parameter. Note that `BeforeAll / AfterAll` hooks accept only `worker` scoped fixtures and don't have access to `World` (as World is re-created for every scenario).

### Conditional hooks

`Before / After` hooks can run conditionally depending on tags. Synax is the same as in Cucumber:

```ts
import { Before, After } from 'playwright-bdd';

Before('@foo and not @bar', async function () {
  console.log('run only before scenarios with @foo and not @bar tags');
});

After('@foo and not @bar', async function () {
  console.log('run only after scenarios with @foo and not @bar tags');
});
```