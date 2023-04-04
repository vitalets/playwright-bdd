# playwright-bdd

This package is a thin layer betwwen [Playwright](https://playwright.dev/) and [Cucumber-js](https://github.com/cucumber/cucumber-js).
It allows to run [Gherkin](https://docs.cucumber.io/docs/gherkin/reference/) BDD tests via Playwright test runner.

> Inspired by issue in Playwright repo [microsoft/playwright#11975](https://github.com/microsoft/playwright/issues/11975)

## Contents

<!-- toc -->

- [How it works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [World](#world)
- [Custom World](#custom-world)
- [Examples](#examples)
- [Debugging](#debugging)
- [VS Code Integration](#vs-code-integration)
- [Limitations](#limitations)
- [Changelog](#changelog)
- [Feedback](#feedback)
- [License](#license)

<!-- tocstop -->

## How it works

There are 2 phases:

#### Phase 1: Generate Playwright tests from Gherkin features
CLI command `bddgen` reads feature files from Cucumber config and generates Playwright tests in `.features-gen` directory

<details>
<summary>Example of generated test</summary>

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
</details>

#### Phase 2: Run generated tests with Playwright runner
Playwright runner grabs generated tests from `.features-gen` and executes them as usual. For each test `playwright-bdd` provides Cucumber World with injected Playwright fixtures (`page`, `browser`, etc). It allows to write step definitions using Playwright API:

<details>
<summary>Example of step definition</summary>

  ```ts
  import { expect } from '@playwright/test';
  import { Given, When, Then } from '@cucumber/cucumber';
  import { World } from 'playwright-bdd';

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
</details>

**Run BDD tests in one command:**
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

## Usage

1. Create feature descriptions in `features/*.feature` files:

   ```gherkin
   Feature: Playwright site

       Scenario: Check title
           Given I open url "https://playwright.dev"
           When I click link "Get started"
           Then I see in title "Playwright"
   ```

2. Create step definitions in `features/steps/*.{ts,js}` files. Use `World` from `playwright-bdd`:

   ```ts
   import { expect } from '@playwright/test';
   import { Given, When, Then } from '@cucumber/cucumber';
   import { World } from 'playwright-bdd';

   Given('I open url {string}', async function (this: World, url: string) {
     await this.page.goto(url);
   });

   When('I click link {string}', async function (this: World, name: string) {
     await this.page.getByRole('link', { name }).click();
   });

   Then(
     'I see in title {string}',
     async function (this: World, keyword: string) {
       await expect(this.page).toHaveTitle(new RegExp(keyword));
     }
   );
   ```

3. Create [Cucumber config file](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md) `cucumber.cjs`:

   ```js
   module.exports = {
     default: {
       require: ['features/steps/**'],
       // uncomment if using TypeScript
       // requireModule: ['ts-node/register'],
     },
   };
   ```

   Or in ESM format `cucumber.mjs`:

   ```js
   export default {
     import: ['features/steps/**'],
     // uncomment if using TypeScript
     // requireModule: ['ts-node/register'],
   };
   ```

4. Create [Playwright config file](https://playwright.dev/docs/test-configuration) `playwright.config.ts`. Set `testDir` pointing to `.features-gen` directory. That directory does not exist yet but will be created during tests generation:

   ```ts
   import { defineConfig, devices } from '@playwright/test';

   export default defineConfig({
     testDir: '.features-gen', // <- generated BDD tests
     projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
   });
   ```

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

## World
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

## Custom World
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
> Perform asynchronous setup and teardown before each test with `init()` / `destroy()` methods.

## Examples

Please checkout these examples depending on your project setup (ESM/CJS and TS/JS):

- [ESM + TypeScript](https://github.com/vitalets/playwright-bdd/tree/main/examples/esm-ts)
- [CJS + TypeScript](https://github.com/vitalets/playwright-bdd/tree/main/examples/cjs-ts)
- [ESM](https://github.com/vitalets/playwright-bdd/tree/main/examples/esm)
- [CJS](https://github.com/vitalets/playwright-bdd/tree/main/examples/cjs)

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

* Cucumber tags not supported yet (wip)
* Cucumber `RULE` not supported yet (wip)
* [Cucumber hooks](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md) do not run. (use Playwright hooks instead?)

## Changelog

#### 1.3.0
* Print parsing errors to the console while generating [#2](https://github.com/vitalets/playwright-bdd/issues/2)

#### 1.2.0
* Initial public release

## Feedback
Feel free to share your feedback in [issues](https://github.com/vitalets/playwright-bdd/issues). 

## License
MIT
