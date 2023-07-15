# playwright-bdd
[![lint](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/playwright-bdd)](https://www.npmjs.com/package/playwright-bdd)

Run BDD tests with [Playwright](https://playwright.dev/) test runner.

> Inspired by the issue in Playwright repo [microsoft/playwright#11975](https://github.com/microsoft/playwright/issues/11975)

## Contents

<!-- toc -->

- [Why Playwright runner](#why-playwright-runner)
- [Installation](#installation)
- [Get started](#get-started)
- [Configuration](#configuration)
    + [ESM](#esm)
- [Writing features](#writing-features)
    + [Run single feature](#run-single-feature)
    + [Skip feature](#skip-feature)
    + [Customize examples title](#customize-examples-title)
- [Writing steps](#writing-steps)
  * [Playwright-style](#playwright-style)
    + [Custom fixtures](#custom-fixtures)
    + [Accessing `testInfo`](#accessing-testinfo)
    + [Using tags](#using-tags)
    + [Using `DataTables`](#using-datatables)
  * [Cucumber-style](#cucumber-style)
    + [World](#world)
    + [Custom World](#custom-world)
- [Watch mode](#watch-mode)
- [Debugging](#debugging)
- [API](#api)
- [VS Code Integration](#vs-code-integration)
- [How it works](#how-it-works)
- [FAQ](#faq)
    + [Is it possible to run BDD tests in a single command?](#is-it-possible-to-run-bdd-tests-in-a-single-command)
    + [Is it possible to apply `test.use()` in a generated test file?](#is-it-possible-to-apply-testuse-in-a-generated-test-file)
- [Limitations](#limitations)
- [Changelog](#changelog)
- [Feedback](#feedback)
- [License](#license)

<!-- tocstop -->

## Why Playwright runner
Both [Playwright](https://playwright.dev/) and [CucumberJS](https://github.com/cucumber/cucumber-js) have their own test runners. 
You can use CucumberJS runner with [Playwright as a library](https://medium.com/@manabie/how-to-use-playwright-in-cucumberjs-f8ee5b89bccc) to test BDD scenarios.
This package offers **alternative way**: convert BDD scenarios into Playwright tests and run them with Playwright runner as usual. 
Such approach brings all the benefits of Playwright runner:

* Automatic browser initialization and cleanup
* Usage of [Playwright fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures)
* Parallelize execution with [sharding](https://timdeschryver.dev/blog/using-playwright-test-shards-in-combination-with-a-job-matrix-to-improve-your-ci-speed#after)
* [...a lot more](https://playwright.dev/docs/library#key-differences)

## Installation

Install from npm:

```
npm i -D playwright-bdd
```

This package uses `@playwright/test` and `@cucumber/cucumber` as a peer dependencies, 
so you may need to install them as well:

```
npm i -D @playwright/test @cucumber/cucumber
```

After installing Playwright you may need to [install browsers](https://playwright.dev/docs/browsers):

```
npx playwright install
```

## Get started
You can follow steps below to setup playwright-bdd manually 
or clone [playwright-bdd-example](https://github.com/vitalets/playwright-bdd-example)
to quickly check how it works.

1. Create the following Playwright config in the project root:
   ```js
   // playwright.config.js
   import { defineConfig } from '@playwright/test';
   import { defineBddConfig } from 'playwright-bdd';

   const testDir = defineBddConfig({
     paths: ['sample.feature'],
     require: ['steps.js'],
   });

   export default defineConfig({
     testDir,
     reporter: 'html',
   });
   ```

2. Describe feature in `sample.feature`:

   ```gherkin
   Feature: Playwright site

       Scenario: Check title
           Given I open url "https://playwright.dev"
           When I click link "Get started"
           Then I see in title "Playwright"
   ```

3. Implement steps in `steps.js`:
   ```ts
   import { expect } from '@playwright/test';
   import { createBdd } from 'playwright-bdd';

   const { Given, When, Then } = createBdd();

   Given('I open url {string}', async ({ page }, url) => {
     await page.goto(url);
   });

   When('I click link {string}', async ({ page }, name) => {
     await page.getByRole('link', { name }).click();
   });

   Then('I see in title {string}', async ({ page }, keyword) => {
     await expect(page).toHaveTitle(new RegExp(keyword));
   });
   ```
   > There is alternative Cucumber-compatible syntax for step definitions, see [Writing steps](#writing-steps).

4. Generate and run tests:

   ```
   npx bddgen && npx playwright test
   ```

   Output:

   ```
   Running 1 test using 1 worker
   1 passed (2.0s)

   To open last HTML report run:

   npx playwright show-report
   ```
   <details>
     <summary>Report</summary>
     <img width="80%" src="https://github.com/vitalets/playwright-bdd/assets/1473072/e327d97c-bc67-4ba2-8660-650f1c479c62"/>
   </details>

5. (Optional) Check out `.features-gen` directory to see what generated tests look like ;)

## Configuration
Configuration is passed to `defineBddConfig()` inside Playwright config file.
Most options are from CucumberJS and there are a few special ones.

Typical CucumberJS options:

| Name             | Type       | Description   
|------------------|------------|------------------------
| `paths`          | `string[]` | Paths to feature files. Default: `features/**/*.{feature,feature.md}` [More](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features)     
| `require`        | `string[]` | Paths to step definitions in **CommonJS**. Default: `features/**/*.(js)` [More](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code)            
| `import`         | `string[]` | Paths to step definitions in **ESM**. Default: `features/**/*.(js)` [More](https://github.com/cucumber/cucumber-js/blob/main/docs/esm.md)                                       

See more options in [CucumberJS docs](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#options).

> Note: Cucumber's option `requireModule: ['ts-node/register']` is not recommended for playwright-bdd. TypeScript compilation is performed with Playwright's built-in loader.

Special `playwright-bdd` options:
| Name                 | Type       | Description
|----------------------|------------|------------------------
| `outputDir`          | `string`   | Directory to output generated test files. Default: `.features-gen` 
| `importTestFrom`     | `string`   | Path to file that exports custom `test` to be used in generated files. Default: `playwright-bdd`
| `examplesTitleFormat`| `string`   | Title format for scenario outline examples in generated tests. Default: `Example #<_index_>`
| `verbose`            | `boolean`  | Verbose output. Default: `false`

Example configuration (CommonJS TypeScript project):
```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'fixtures.ts',
  paths: ['feature/*.feature'],
  require: ['steps/**/*.ts'],
});

export default defineConfig({
  testDir,
});
```

Return value of `defineBddConfig()` is a resolved output directory where test files will be generated.
It is convenient to use it as a `testDir` option for Playwright.

> If there is an external `cucumber.js` config file, it is also merged into configuration.

#### ESM
If your project runs in ESM (has `"type": "module"` in `package.json`),
the configuration in `playwright.config.js` is following:

For JavaScript ESM:
```diff
const testDir = defineBddConfig({,
-  require: ['steps.js'],
+  import: ['steps.js'],
});
```

For TypeScript ESM:
```diff
const testDir = defineBddConfig({,
-  require: ['steps.js'],
+  import: ['steps.ts'],
});
```

Command to run tests:
```
NODE_OPTIONS='--loader ts-node/esm --no-warnings' npx bddgen && npx playwright test
```

## Writing features
Write features in `*.feature` files using [Gherkin syntax](https://cucumber.io/docs/gherkin/reference/#keywords). 
All keywords are supported.

Example:

```gherkin
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
```

#### Run single feature
Use `@only` tag to run a single feature / scenario:
```gherkin
@only
Feature: Playwright site
    
    @only
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

#### Skip feature
Use `@skip` (or `@fixme`) tag to skip a particular feature / scenario:
```gherkin
@skip
Feature: Playwright site

    @skip
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

#### Customize examples title
By default each row from Scenario Outline examples is converted into test with title `Example #{index}`.
It can be not reliable for reporters that keep track of test history, because on every insertion / deletion of rows
test titles will shift.

You can provide own fixed title format by adding a special comment right above `Examples`. 
The comment should start with `# title-format:` and can reference column names as `<column>`:
```gherkin
Feature: calculator

    Scenario Outline: Check doubled
      Then Doubled <start> equals <end>

      # title-format: Example for <start>
      Examples:
          | start | end |
          |    2  |   4 |
          |    3  |   6 |
```

Generated test file:
```js
test.describe("calculator", () => {

  test.describe("Check doubled", () => {

    test("Example for 2", async ({ Then }) => {
      await Then("Doubled 2 equals 4");
    });

    test("Example for 3", async ({ Then }) => {
      await Then("Doubled 3 equals 6");
    });
```

## Writing steps
There are two ways of writing step definitions:
1. **Playwright-style** - recommended for new projects or adding BDD to existing Playwright projects
2. **Cucumber-style** - recommended for migrating existing CucumberJS projects to Playwright runner

### Playwright-style
Playwright-style allows you to write step definitions like a regular playwright tests.
You get all benefits of [custom fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures),
both test-scoped and worker-scoped. 

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

#### Custom fixtures
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

See [full example of Playwright-style](examples/playwright-style).

#### Accessing `testInfo`
To access [`testInfo`](https://playwright.dev/docs/api/class-testinfo) for conditionally skipping tests, attaching screenshots, etc. use special `$testInfo` fixture:

```ts
Given('I do something', async ({ $testInfo }) => { 
  console.log($testInfo.title); // logs test title "I do something"
  $testInfo.skip(); // skips test
});
```

#### Using tags
[Cucumber tags](https://cucumber.io/docs/cucumber/api/?lang=javascript#tags) can be accessed by special `$tags` fixture:

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
For example, you can overwrite `viewport` for mobile version:

```gherkin
Feature: Playwright site
    
    @mobile
    Scenario: Check title
      Given I do something
      ...
```

Custom `fixtures.ts`:
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

Please note, that for now **Cucumber tags are not inserted into test titles** for Playwright. 
This is done intentionally to keep test titles unchanged. Waiting for Playwright tags API, see [microsoft/playwright#23180](https://github.com/microsoft/playwright/issues/23180).

However, you can simply put Playwright tags into scenario name:
```gherkin
Feature: Playwright site
    
    Scenario: Check title @slow
      ...
```

#### Using `DataTables`
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

### Cucumber-style
Cucumber-style step definitions are compatible with CucumberJS:

* import `Given`, `When`, `Then` from `@cucumber/cucumber` package
* [use regular functions for steps](https://github.com/cucumber/cucumber-js/blob/main/docs/faq.md#the-world-instance-isnt-available-in-my-hooks-or-step-definitions) (not arrow functions!) 
* use `World` from `playwright-bdd` to access Playwright API 

Example (TypeScript):

```ts
import { Given, When, Then } from '@cucumber/cucumber';
import { World } from 'playwright-bdd';
import { expect } from '@playwright/test';

Given('I open url {string}', async function (this: World, url: string) {
  await this.page.goto(url);
});

When('I click link {string}', async function (this: World, name: string) {
  await this.page.getByRole('link', { name }).click();
});

Then('I see in title {string}', async function (this: World, keyword: string) {
  await expect(this.page).toHaveTitle(new RegExp(keyword));
});
```

#### World
Playwright-bdd extends [Cucumber World](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md) with Playwright [built-in fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures) and [testInfo](https://playwright.dev/docs/test-advanced#testinfo-object). Simply use `this.page` or `this.testInfo` in step definitions:

```js
import { Given, When, Then } from '@cucumber/cucumber';

Given('I open url {string}', async function (url) {
  await this.page.goto(url);
});
```

In TypeScript you should import `World` from `playwright-bdd` for proper typing:
```ts
import { Given, When, Then } from '@cucumber/cucumber';
import { World } from 'playwright-bdd';

Given('I open url {string}', async function (this: World, url: string) {
  await this.page.goto(url);
});
```

Check out [all available props of World](https://github.com/vitalets/playwright-bdd/blob/main/src/run/world.ts). 

#### Custom World
To use Custom World you should inherit it from playwright-bdd `World` and pass to Cucumber's `setWorldConstructor`:

```ts
import { setWorldConstructor } from '@cucumber/cucumber';
import { World, WorldOptions } from 'playwright-bdd';

export class CustomWorld extends World {
  myBaseUrl: string;
  constructor(options: WorldOptions) {
    super(options);
    this.myBaseUrl = 'https://playwright.dev';
  }

  async init() {
    await this.page.goto(this.myBaseUrl);
  }
}

setWorldConstructor(CustomWorld);
```
> Consider asynchronous setup and teardown of World instance with `init()` / `destroy()` methods.

See [full example of Cucumber-style](examples/cucumber-style).

## Watch mode
To watch feature / steps files and automatically regenerate tests you can use [nodemon](https://github.com/remy/nodemon):
```
npx nodemon -w ./features -w ./steps -e feature,js,ts --exec 'npx bddgen'
```

To automatically rerun tests after changes you can run the above command together with [Playwright `--ui` mode](https://playwright.dev/docs/test-ui-mode), utilizing [npm-run-all](https://github.com/mysticatea/npm-run-all). Example `package.json`:

```json
"scripts": {
  "watch:bdd": "nodemon -w ./features -w ./steps -e feature,js,ts --exec 'npx bddgen'",
  "watch:pw": "playwright test --ui",
  "watch": "run-p watch:*"
}
```

## Debugging

You can debug tests as usual with `--debug` flag:
```
npx bddgen && npx playwright test --debug
```
See more info on debugging in [Playwright docs](https://playwright.dev/docs/debug).

## API

##### `defineBddConfig(config)`
Defines BDD config inside Playwright config file.

**Params**
  * `config` *object* - BDD [configuration](#configuration)

**Returns**: *string* - directory where test files will be generated

##### `createBdd(test?)`
Creates `Given`, `When`, `Then` functions for defining steps.

**Params**
  * `test` *object* - custom test instance

**Returns**: *object* - `{ Given, When, Then }`

##### `Given(fixtures, ...args)`
Defines `Given` step implementation.

**Params**
  * `fixtures` *object* - Playwright fixtures
  * `...args` *array* - arguments captured from step pattern

##### `When(fixtures, ...args)`
Defines `When` step implementation.

**Params**
  * `fixtures` *object* - Playwright fixtures
  * `...args` *array* - arguments captured from step pattern

##### `Then(fixtures, ...args)`
Defines `Then` step implementation.

**Params**
  * `fixtures` *object* - Playwright fixtures
  * `...args` *array* - arguments captured from step pattern

## VS Code Integration

* [Playwright extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) works the usual way. You can click and run tests from `.features-gen` directory:
  <img width="70%" src="https://user-images.githubusercontent.com/1473072/229162634-8a801f6e-8a79-407b-889b-7769f957896a.png">

* [Cucumber autocompletion](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) works as usual:
  <img width="70%" src="https://user-images.githubusercontent.com/1473072/229165348-eae41fb8-0918-48ac-8644-c55a880860de.png">

## How it works

**Phase 1: Generate Playwright test files from BDD feature files**

From
```gherkin
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
```

To
```js
import { test } from 'playwright-bdd';

test.describe('Playwright site', () => {

  test('Check title', async ({ Given, When, Then }) => {
    await Given('I open url "https://playwright.dev"');
    await When('I click link "Get started"');
    await Then('I see in title "Playwright"');
  });

});    
```

**Phase 2: Run test files with Playwright runner**

Playwright runner executes generated test files as it would normally do. 
Playwright-bdd automatically provides Playwright API (`page`, `browser`, etc) in step definitions:

```js
Given('I open url {string}', async ({ page }, url) => {
  await page.goto(url);
});

When('I click link {string}', async ({ page }, name) => {
  await page.getByRole('link', { name }).click();
});

Then('I see in title {string}', async ({ page }, text) => {
  await expect(page).toHaveTitle(new RegExp(text));
});  
```

## FAQ

#### Is it possible to run BDD tests in a single command? 
This approach was initially implemented: test files were generated directly in `playwright.config.ts` before test execution. It allowed to run tests with `npx playwright test` instead of having two commands as `npx bddgen && npx playwright test`. But later several issues appeared:

1. It became really hard to decide when to generate test files because Playwright config is executed many times from different sources: workers, VS Code extension, UI mode, etc.

2. Implementation of watch mode is tricky. It is impossible to just run `nodemon` with `playwright.config.ts`. Separate command for test generation allows to easily [support watch mode](#watch-mode) 

3. Watching files in `--ui` mode leads to circullar dependency: a change in test files triggers test run which in turn re-imports config and once again triggers a change in test files

For now decoupling *test generation* from *test running* is a better solution for integration with Playwright's tooling.

#### Is it possible to apply `test.use()` in a generated test file?
Test files generation is a fully automatic process, no manual interceptions allowed.
But instead of applying `test.use` (that has impact to all tests in a file)
you can [utilize tags](#accessing-tags) with custom fixtures.
That is more flexible approach and allows to selectively change settings for a particular scenario/test.

## Limitations

Currently there are some limitations:

* [Cucumber hooks](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md) are not supported yet, see [#15](https://github.com/vitalets/playwright-bdd/issues/15).
  For now, consider using [Playwright fixtures](#custom-fixtures) instead, that are more flexible and straightforward.

## Changelog
Please check out [CHANGELOG.md](CHANGELOG.md).

## Feedback
Feel free to share your feedback in [issues](https://github.com/vitalets/playwright-bdd/issues).
This way you will help Playwright team to proceed with BDD implementation in Playwright core.

## License
MIT
