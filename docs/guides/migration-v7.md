# Migration to v7

Playwright-bdd **v7** introduces several significant improvements. The root one is **removing dependency on Cucumber runner**. Now features and steps are imported directly without involving `@cucumber/cucumber` package. That gives a lot of advantages for dev experience, performance and code maintenance. This guide will go through all the changes and provide action items for migration.

The guide consists of two parts, depending on steps style you are using:
1. for **all users** - no matter what steps-style is used
2. for **cucumber-style** steps - there are additional actions

Migaration actions depend on steps style you are using:
* if you are using **playwright-style** or **decorator** steps, migration should be easy, without any code changes or with minimal ones
* If you are using **cucumber-style** steps, there are required actions that will be described in a separate section

## Update packages
Currently v7 is in release candidate status. To try it out please run the following commands:
```
npm un @cucumber/cucumber
npm i -D playwright-bdd@next
```

* [Steps location](#steps-location)
* [Features location](#features-location)

## All users
Below changes are related to all playwright-bdd users.

#### Steps location
BDD config options `require` and `import` are replaced with all-in-one option `steps`. It is a glob pattern for searching step definition files, defined as a string or array of strings. Important change to previous behavior - it has **no default location** as [in Cucumber](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code). If your config relies on default location, please set steps path explicitly.

Before:
```ts
const testDir = defineBddConfig({
  require: ['steps/*.ts'],
  // or for ESM
  // import: ['steps/*.ts'],
});
```
Since v7:
```ts
const testDir = defineBddConfig({
  steps: 'steps/*.ts'
});
```

> `require` and `import` options are still allowed in BDD configuration, but under the hood they are converted into `steps` and will be deprecated in the future.

#### Features location
BDD config option `paths` is replaced with `features`. It is a glob pattern for searching feature files, defined as a string or array of strings. Important change to previous behavior - it has **no default location** as [in Cucumber](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features). If your config relies on default location, please set features path explicitly.

Before:
```ts
const testDir = defineBddConfig({
  paths: ['features/*.feature'],
});
```
Since v7:
```ts
const testDir = defineBddConfig({
  features: 'features/*.feature',
});
```

> `paths` option is still allowed in BDD configuration, but under the hood it is  converted into `features` and will be deprecated in the future.

### importTestFrom
Since v7 BDD config option `importTestFrom` can be omitted in most cases. Now playwright-bdd automatically checks fixtures and detects optimal file to import test in spec files. The only requirement - you should include these fixture files in `steps` option.

Before:
```ts
const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  require: ['steps/steps.ts'],
});
```
Since v7:
```ts
const testDir = defineBddConfig({
  steps: ['steps/steps.ts', 'steps/fixtures.ts']
});
// OR
const testDir = defineBddConfig({
  steps: 'steps/*.ts'
});
```

> `importTestFrom` can be still used for some specific casees. If you have such case, feel free to share it in issues, we can try to improve the algorithm.

#### Cucumber config
Before v7, if there was `cucumber.js` file, it was loaded and merged into BDD configuration. Now `cucumber.js` is not loaded anymore. You can provide all BDD options in `playwright.config.ts` explicitly.

#### Snippets
Before v7, you could configure [snippets](https://github.com/cucumber/cucumber-js/blob/main/docs/snippets.md) via Cucumber options `snippetInterface` / `snippetSyntax`. Now these options are dropped from BDD configuration. Playwright-bdd automatically detects style of your steps (playwright-style / cucumber-style / decorators) and shows propper syntax for missing steps.

Example of Playwright-style snippet:
```
Some steps are without definition!

// 1. Missing step definition for "features/one.feature:23:5"
Then('I see in title {string}', async ({}, arg: string) => {
  // ...
});

Missing step definitions: 1.
Use snippets above to create them.
```

> If you have strong requirement for custom snippets, feel free to open an issue


#### Custom parameter types
- `defineParameterType` should be imported from `playwright-bdd` instead of `@cucumber/cucumber`
- `defineParameterType` is supported in decorator steps 

Example:
```ts
import { defineParameterType } from 'playwright-bdd';

type Color = 'red' | 'blue' | 'yellow';
defineParameterType({
  name: 'color',
  regexp: /red|blue|yellow/,
  transformer: (s) => s.toLowerCase() as Color,
});

Given('step with {color}', ({}, color: Color) => { ... });
```

#### ESM
ESM projects can be executed without `--loader=ts-node/esm` (since Playwright 1.41)

Before:
```
npx cross-env NODE_OPTIONS="--loader=ts-node/esm --no-warnings" bddgen && npx playwright test
```
Since v7:
```
npx bddgen && npx playwright test
```

#### DataTable
`DataTable` should be imported from `playwright-bdd` instead of `@cucumber/cucumber`.

Before:
```ts
import { DataTable } from '@cucumber/cucumber';
```
Since v7:
```ts
import { DataTable } from 'playwright-bdd';
```

#### Other changes
* minimal Playwright version increased to **v1.35**
* minimal Node.js version increased to **v18**

## Cucumber-style only
Below changes are related only to **cucumber-style steps**.

#### Given/When/Then import
Before v7 `Given / When / Then` for cucumber-style were imported directly from `@cucumber/cucumber` package. Now Cucumber package is removed, and these functions should be imported from `createBdd` call similar to Playwright-style steps. The only difference - you pass `worldFixture` name in a second parameter. 

Before:

**steps.ts**
```ts
import { Given, When, Then } from '@cucumber/cucumber';

Given('I am on home page', async function () {
  await this.page.goto('/');
});
```
Since v7:

**steps.ts**
```ts
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  await this.page.goto('/');
});
```

**fixtures.ts**
```ts 
import { test as base, createBdd } from 'playwright-bdd';

// define simplest world
type World  = { page: Page };

export const test = base.extend<{ world: World }>({
  world: async ({ page }, use) => {
    const world = { page };
    await use(world);
  }),
});

export const { Given, When, Then } = createBdd(test, { 
  worldFixture: 'world' 
});
```

> Check-out full Cucumber-style example in [examples/cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).

#### Cucumber world
There is no built-in Cucumber world anymore. Although it requires more code in userland,
it gives your full control over world's shape and performance. You pass world as a regular Playwright fixture and provide only dependencies that you need. You are not restrcited to inherit world from some base class. When world fixture is provided to `test.extend()`, you pass the name of that fixture to `createBdd` and get `Given / When / Then` bound to that world.

Example:

1. **world.ts** - create some world

```ts
import { Page, TestInfo } from '@playwright/test';

export class MyWorld {
  constructor (public page: Page, testInfo: TestInfo) {}

  async openHomepage() {
    await this.page.goto('/');
  }

  async clickLink(name: string) {
    await this.page.getByRole('link', { name }).click();
  }
};
```

2. **fixtures.ts** - wrap world into Playwright fixture and create `Given / When / Then`

```ts
import { test as base, createBdd } from 'playwright-bdd';
import { MyWorld } from './world';

export const test = base.extend<{ myWorld: MyWorld }>({
  myWorld: async ({ page }, use, testInfo) => use(new MyWorld(page, testInfo));
});

export const { Given, When, Then } = createBdd(test, { 
  worldFixture: 'myWorld' 
});
```

3. **steps.ts** - write steps in cucumber-style

```ts
import { Given, When, Then } from './fixtures';

Given('I am on the home page', async function () {
  await this.openHomepage()
});

When('I click link {string}', async function (text: string) {
  await this.clickLink(text);
});
```

> Check-out full Cucumber-style example in [examples/cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).