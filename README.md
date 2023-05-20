# playwright-bdd
[![lint](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/playwright-bdd)](https://www.npmjs.com/package/playwright-bdd)

Run [CucumberJS](https://github.com/cucumber/cucumber-js) BDD tests with [Playwright](https://playwright.dev/) test runner.

> Inspired by issue in Playwright repo [microsoft/playwright#11975](https://github.com/microsoft/playwright/issues/11975)

## Contents

<!-- toc -->

- [Why Playwright runner](#why-playwright-runner)
- [How it works](#how-it-works)
- [Installation](#installation)
- [Get started](#get-started)
- [Configuration](#configuration)
  * [Cucumber](#cucumber)
  * [Playwright](#playwright)
- [Writing features](#writing-features)
    + [Run single feature](#run-single-feature)
    + [Skip feature](#skip-feature)
- [Writing steps](#writing-steps)
  * [Playwright-style](#playwright-style)
    + [Worker-scoped fixtures](#worker-scoped-fixtures)
  * [Cucumber-style](#cucumber-style)
    + [World](#world)
    + [Custom World](#custom-world)
- [Examples](#examples)
- [Watch mode](#watch-mode)
- [Debugging](#debugging)
- [VS Code Integration](#vs-code-integration)
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

## How it works

**Phase 1: Generate Playwright test files from feature files**

CLI command `bddgen` reads Cucumber config and converts feature files into Playwright test files:

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

**Phase 2: Run generated test files with Playwright runner**

Playwright runner takes generated test files and runs them as usual. Playwright-bdd automatically provides Playwright API (`page`, `browser`, etc) in step definitions:

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

**Run BDD tests in single command:**
```
npx bddgen && npx playwright test
```

## Installation

Install from npm:

```
npm i -D playwright-bdd
```

This package uses `@playwright/test` and `@cucumber/cucumber` as peer dependencies, so you may need to install them as well:

```
npm i -D @playwright/test @cucumber/cucumber
```

After installing Playwright you may need to [install browsers](https://playwright.dev/docs/browsers):

```
npx playwright install
```

## Get started

1. Create Cucumber config `cucumber.cjs` in project root:

    ```js
    module.exports = {
      default: {
        paths: [ 'features/**/*.feature' ],       
        require: [ 'features/steps/**/*.{ts,js}' ],
        // uncomment if using TypeScript
        // requireModule: ['ts-node/register'],
        publishQuiet: true,
      },
    };
    ```

2. Create Playwright config `playwright.config.js`. Set `testDir` pointing to `.features-gen` directory. That directory does not exist yet but will be created during tests generation:

   ```js
   import { defineConfig } from '@playwright/test';

   export default defineConfig({
     testDir: '.features-gen', // <- generated BDD tests
     projects: [{ name: 'e2e' }],
   });
   ```

3. Describe features in `features/*.feature` files:

   ```gherkin
   Feature: Playwright site

       Scenario: Check title
           Given I open url "https://playwright.dev"
           When I click link "Get started"
           Then I see in title "Playwright"
   ```

4. Write step definitions in `features/steps/*.{ts,js}` files:
   ```ts
   import { createBDD } from 'playwright-bdd';
   import { expect } from '@playwright/test';

   const { Given, When, Then } = createBDD();

   Given('I open url {string}', async ({ page }, url: string) => {
     await page.goto(url);
   });

   When('I click link {string}', async ({ page }, name: string) => {
     await page.getByRole('link', { name }).click();
   });

   Then('I see in title {string}', async ({ page }, keyword: string) => {
     await expect(page).toHaveTitle(new RegExp(keyword));
   });
   ```
   > There is alternative Cucumber-style syntax for step definitions, see [Writing steps](#writing-steps) section.

5. Run command to generate and execute tests:

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

## Configuration
`playwright-bdd` does not have own config, it just uses Cucumber and Playwright config files. 

### Cucumber
Create [Cucumber config file](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md) to let `playwright-bdd` know how to load your features and step definitions.

Example of `cucumber.cjs`:
```js
module.exports = {
  default: {
    paths: [ 'features/**/*.feature' ],       
    require: [ 'features/steps/**/*.{ts,js}' ],
    // uncomment if using TypeScript
    // requireModule: ['ts-node/register'],
    publishQuiet: true,
  },
};
```

Or in ESM format `cucumber.mjs`:

```js
export default {
  paths: [ 'features/**/*.feature' ], 
  import: [ 'features/steps/**/*.{ts,js}' ],
  // uncomment if using TypeScript
  // requireModule: ['ts-node/register'],
  publishQuiet: true,
};
```

### Playwright
Create [Playwright config file](https://playwright.dev/docs/test-configuration) for running generated tests. Set `testDir` pointing to output directory of `bddgen` command (default is `.features-gen`).

Example of `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.features-gen', // <- generated BDD tests
  projects: [{ name: 'e2e' }],
});
```

## Writing features
Write features in `*.feature` files using [Gherkin syntax](https://cucumber.io/docs/gherkin/reference/#keywords). All keywords are supported.

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

    Scenario: Check title
        Given I open url "https://playwright.dev"
```

#### Skip feature
Use `@skip` (or `@fixme`) tag to skip particular feature / scenario:
```gherkin
@skip
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## Writing steps
There are two ways of writing step definitions:
1. Playwright-style
2. Cucumber-style

### Playwright-style
Playwright-style allows you to write step definitions like a regular playwright tests.
You get all benefits of [custom fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures) (both test-scoped and worker-scoped). Recommended for setting up playwright-bdd from scratch.

Playwright-style highlights:

* use `Given`, `When`, `Then` from `createBDD()` call (see example below)
* pass custom fixtures to `createBDD()` similar to [test.extend](https://playwright.dev/docs/test-fixtures#creating-a-fixture)
* use arrow functions for step definitions
* don't use `World` and `before/after` hooks in favor of fixtures

Example:

```ts
import { createBDD } from 'playwright-bdd';
import { Page } from '@playwright/test';

// test-scoped fixture
class MyPage {
  constructor(public page: Page) {}

  async openLink(name: string) {
    await this.page.getByRole('link', { name }).click();
  }
}

// pass custom fixtures to createBDD() similar to test.extend()
const { Given, When, Then } = createBDD<{ myPage: MyPage }>({
  myPage: async ({ page }, use) => {
    await use(new MyPage(page));
  }
});

// use fixtures in steps
Given('I open url {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

When('I click link {string}', async ({ myPage }, name: string) => {
  await myPage.openLink(name);
});
```
See [full example of Playwright-style](examples/pwstyle).

#### Worker-scoped fixtures
Worker-scopd fixtures can be defined the same way as in regular playwright tests:

```ts
import { createBDD } from 'playwright-bdd';

// worker-scoped fixture
class Account {
  constructor(public username: string, public password: string) {}
}

// pass custom fixtures to createBDD() similar to test.extend()
const { Given, When, Then } = createBDD<{}, { account: Account }>({
  account: [
    async ({}, use) => {
      await use(new Account('user', '123'));
    },
    { scope: 'worker' },
  ],
});

// use fixtures in steps
Given('I am a user', async ({ account }) => {
  // ...
});
```

### Cucumber-style
Cucumber-style step definitions are compatible with CucumberJS. Use it if you are migrating from CucumberJS runner and have a lot of existing tests.

Cucumber-style highlights:

* use `Given`, `When`, `Then` from `@cucumber/cucumber` package
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

## Examples

There several working examples depending on your project setup (ESM/CJS and TS/JS):

- [ESM + TypeScript](https://github.com/vitalets/playwright-bdd/tree/main/examples/esm-ts)
- [CJS + TypeScript](https://github.com/vitalets/playwright-bdd/tree/main/examples/cjs-ts)
- [ESM](https://github.com/vitalets/playwright-bdd/tree/main/examples/esm)
- [CJS](https://github.com/vitalets/playwright-bdd/tree/main/examples/cjs)

## Watch mode
To watch `.feature` files and automatically re-generate tests you can use [nodemon](https://github.com/remy/nodemon):
```
npx nodemon --watch ./features --ext feature --exec 'npx bddgen'
```

## Debugging

You can debug tests as usual with `--debug` flag:

```
npx bddgen && npx playwright test --debug
```

## VS Code Integration

* [Playwright extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) works as usual. You can run/debug tests in `.features-gen` directory:
  <img width="70%" src="https://user-images.githubusercontent.com/1473072/229162634-8a801f6e-8a79-407b-889b-7769f957896a.png">

* [Cucumber autocompletion](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) works as usual:
  <img width="70%" src="https://user-images.githubusercontent.com/1473072/229165348-eae41fb8-0918-48ac-8644-c55a880860de.png">

## Limitations

Currently there are some limitations:

* Cucumber tags not supported yet (wip, [#8](https://github.com/vitalets/playwright-bdd/issues/8))
* [Cucumber hooks](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md) do not run. (use Playwright fixtures instead?)

## Changelog

#### 2.2.0
* Run only one scenario / skip scenario [#14](https://github.com/vitalets/playwright-bdd/issues/14)
* Support "Scenario Template" keyword [#20](https://github.com/vitalets/playwright-bdd/issues/20)

##### 2.1.0
* Support Gherkin i18n [#13](https://github.com/vitalets/playwright-bdd/issues/13)

##### 2.0.0
* Support "Rule" keyword [#7](https://github.com/vitalets/playwright-bdd/issues/7)
* Generate test files close to Gherkin document structure [#10](https://github.com/vitalets/playwright-bdd/issues/10)

##### 1.3.0
* Print parsing errors to the console while generating [#2](https://github.com/vitalets/playwright-bdd/issues/2)

##### 1.2.0
* Initial public release

## Feedback
Feel free to share your feedback in [issues](https://github.com/vitalets/playwright-bdd/issues). 

## License
MIT
