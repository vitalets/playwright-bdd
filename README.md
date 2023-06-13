# playwright-bdd
[![lint](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/playwright-bdd)](https://www.npmjs.com/package/playwright-bdd)

Run [CucumberJS](https://github.com/cucumber/cucumber-js) BDD tests with [Playwright](https://playwright.dev/) test runner.

> Inspired by issue in Playwright repo [microsoft/playwright#11975](https://github.com/microsoft/playwright/issues/11975)

## Contents

<!-- toc -->

- [Why Playwright runner](#why-playwright-runner)
- [Installation](#installation)
- [Get started](#get-started)
- [Configuration](#configuration)
- [Writing features](#writing-features)
    + [Run single feature](#run-single-feature)
    + [Skip feature](#skip-feature)
- [Writing steps](#writing-steps)
  * [Playwright-style](#playwright-style)
    + [Custom fixtures](#custom-fixtures)
    + [Accessing `testInfo`](#accessing-testinfo)
  * [Cucumber-style](#cucumber-style)
    + [World](#world)
    + [Custom World](#custom-world)
- [Watch mode](#watch-mode)
- [API](#api)
- [VS Code Integration](#vs-code-integration)
- [How it works](#how-it-works)
- [FAQ](#faq)
    + [Is it possible to run BDD tests in signle command?](#is-it-possible-to-run-bdd-tests-in-signle-command)
- [Limitations](#limitations)
- [Changelog](#changelog)
- [Feedback](#feedback)
- [License](#license)

<!-- tocstop -->

## Why Playwright runner
Both Playwright and Cucumber have their own test runners. You can use Cucumber runner with [Playwright included as a library](https://medium.com/@manabie/how-to-use-playwright-in-cucumberjs-f8ee5b89bccc). Alternative way (provided by this package) is to convert BDD scenarios into Playwright tests and run them using Playwright runner. It gives the following benefits:

* Automatic browser initialization and cleanup
* Usage of [Playwright fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures) instead of `before / after` hooks
* Parallelize tests with [sharding](https://timdeschryver.dev/blog/using-playwright-test-shards-in-combination-with-a-job-matrix-to-improve-your-ci-speed#after)
* [...a lot more](https://playwright.dev/docs/library#key-differences)

## Installation

Install from npm:

```
npm i -D playwright-bdd
```

This package uses `@playwright/test` and `@cucumber/cucumber` as peer dependencies, 
so you may need to install them as well:

```
npm i -D @playwright/test @cucumber/cucumber
```

After installing Playwright you may need to [install browsers](https://playwright.dev/docs/browsers):

```
npx playwright install
```

## Get started

1. Create the following Playwright config in project root:
   ```js
   // playwright.config.js
   import { defineConfig } from '@playwright/test';
   import { defineBddConfig } from 'playwright-bdd';

   const testDir = defineBddConfig({
     paths: ['sample.feature'],
     require: ['steps.js'],
     // uncomment and install 'ts-node' if using TypeScript
     // requireModule: ['ts-node/register'],
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
   > There is alternative Cucumber-compatible syntax for step definitions, see [Writing steps](#writing-steps) section.

4. Run tests:

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
     <img width="70%" src="https://github.com/vitalets/playwright-bdd/assets/1473072/65bf827f-918e-43e0-9eb7-eaba7950b7c1"/>
   </details>

5. (Optional) Check out `.features-gen` directory to see how generated tests look like ;)

## Configuration
Configuration is passed to `defineBddConfig()` inside Playwright config file.
Most options are from CucumberJS and there are a few special.

Typical Cucumber options:

| Name             | Type       | Description   
|------------------|------------|------------------------
| `paths`          | `string[]` | Paths to feature files. Default: `features/**/*.{feature,feature.md}`. [More](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features)     
| `require`        | `string[]` | Paths to step definitions in **CommonJS**. Default: `features/**/*.(js)` [More](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code)            
| `import`         | `string[]` | Paths to step definitions in **ESM**. Default: `features/**/*.(js)`. [More](https://github.com/cucumber/cucumber-js/blob/main/docs/esm.md)                                       
| `requireModule`  | `string[]` | Names of transpilation modules to load. Default: `[]`. [More](https://github.com/cucumber/cucumber-js/blob/main/docs/transpiling.md)

See more options in [CucumberJS docs](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#options).

Own `playwright-bdd` options:
| Name              | Type       | Description
|-------------------|------------|------------------------
| `outputDir`       | `string`   | Directory to output generated test files. Default: `.features-gen` 
| `importTestFrom`  | `string`   | Path to file that exports custom `test` to be used in generated files. Default: `playwright-bdd`
| `verbose`         | `boolean`  | Verbose output. Default: `false`

Example configuration:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  importTestFrom: 'fixtures.ts',
  paths: ['feature/*.feature'],
  require: ['steps/**/*.ts'],
  requireModule: ['ts-node/register'],
});

export default defineConfig({
  testDir,
});
```

Return value is path where test files will be generated.
It is convenient to use it as `testDir` option for Playwright.

> If there is external `cucumber.js` config file, it is also merged into configuration.

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
Use `@only` tag to run single feature / scenario:
```gherkin
@only
Feature: Playwright site
    
    @only
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

#### Skip feature
Use `@skip` (or `@fixme`) tag to skip particular feature / scenario:
```gherkin
@skip
Feature: Playwright site

    @skip
    Scenario: Check title
        Given I open url "https://playwright.dev"
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

1. Define custom fixtures with `test.extend()` and export `test` instance. For example, `fixtures.ts`:
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
    export const test = test.extend<{ myPage: MyPage }>({
      myPage: async ({ page }, use) => {
        await use(new MyPage(page));
      }
    });
    ```
2. Pass custom `test` function to `createBdd()` as argument. For example, `steps.ts`:
    ```ts
    import { createBdd } from 'playwright-bdd';
    import { test } from './fixtures';

    const { Given, When, Then } = createBdd(test);

    Given('I open url {string}', async ({ myPage }, url: string) => { ... });
    When('I click link {string}', async ({ myPage }, name: string) => { ... });
    Then('I see in title {string}', async ({ myPage }, text: string) => { ... });
    ```

3. Set config option `importTestFrom` pointing to file exporting custom `test` function. 
   For example: 
    ```js
    const testDir = defineBddConfig({
      importTestFrom: 'fixtures.ts',
      // ...
    });
    ```
    Effect in generated files:
    ```diff
    -import { test } from "playwright-bdd";  
    +import { test } from "./fixtures.ts";  
    ```

See [full example of Playwright-style](examples/playwright-style).

#### Accessing `testInfo`
To access [`testInfo`](https://playwright.dev/docs/api/class-testinfo) for conditionally skipping tests, attaching screenshots, etc.. use special `$testInfo` fixture:

```ts
Given('I do something', async ({ $testInfo }) => { 
  console.log($testInfo.title); // I do something
  $testInfo.skip();
});
```

### Cucumber-style
Cucumber-style step definitions are compatible with CucumberJS:

* import `Given`, `When`, `Then` from `@cucumber/cucumber` package
* [use regular functions for steps](https://github.com/cucumber/cucumber-js/blob/main/docs/faq.md#the-world-instance-isnt-available-in-my-hooks-or-step-definitions) (not arrows!) 
* use `World` from `playwright-bdd` to access Playwright API 

Example (typescript):

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
Playwright-bdd extends [Cucumber World](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md) with Playwright [built-in fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures) and [testInfo](https://playwright.dev/docs/test-advanced#testinfo-object). Just use `this.page` or `this.testInfo` in step definitions:

```js
import { Given, When, Then } from '@cucumber/cucumber';

Given('I open url {string}', async function (url) {
  await this.page.goto(url);
});
```

In TypeScript you should import `World` from `playwright-bdd` for propper typing:
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
To watch feature / steps files and automatically re-generate tests you can use [nodemon](https://github.com/remy/nodemon):
```
npx nodemon -w ./features -w ./steps -e feature,js,ts --exec 'npx bddgen'
```

## API

##### `defineBddConfig(config)`
Defines BDD config inside Playwright config file.

**Params**
  * `config` *object* - bdd [configuration](#configuration)

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

* [Playwright extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) works as usual. You can run/debug tests in `.features-gen` directory:
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

Playwright runner executes generated test files as usual. 
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

#### Is it possible to run BDD tests in signle command? 
This approach was initially implemented: generation of test files was done directly in `playwright.config.ts` before test execution. It allows to run tests with `npx playwright test` instead of having separate step as `npx bddgen && npx playwright test`. But later several issues appeared:

1. Playwright config is executed many times from a lot of places (workers, VS Code extension, UI mode, etc). And logic to detect when we should run test generation and when not becomes complex and messy

2. Implementation of watch mode is questionable. It is impossible to just run `nodemon` with `playwright.config.ts`. Having separate command for test generation allows to [easily](#watch-mode) support watch mode

3. Watching files in `--ui` mode leads to circullar dependency: change in test files triggers test run that in turn re-imports config and triggers test files update again

Fow now decoupling *test generation* from *test running* looks a better option for integration with all Playwright's tooling.

## Limitations

Currently there are some limitations:

* Cucumber tags not supported yet (wip, [#8](https://github.com/vitalets/playwright-bdd/issues/8))
* [Cucumber hooks](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md) do not run. Consider using Playwright fixtures instead.

## Changelog
Please check out [CHANGELOG.md](CHANGELOG.md).

## Feedback
Per communication from Playwright team feedback is important for implementing BDD in Playwright core.
Feel free to share your experience/suggestions in [issues](https://github.com/vitalets/playwright-bdd/issues). 

## License
MIT
