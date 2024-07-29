# Migration to v7

?> Your feedback on **v7** is really appreciated ❤️

Playwright-bdd **v7** introduces several significant improvements. The root one is **removing dependency on Cucumber runner** ([#136](https://github.com/vitalets/playwright-bdd/issues/136)). Now features and steps are handled directly without involving `@cucumber/cucumber` package. That gives many advantages for dev experience, performance and future maintenance of `playwright-bdd`. This guide will go through all the changes and provide necessary actions.

The guide consists of two parts, depending on steps style you are using:
1. actions for **all users**
2. additional actions for **cucumber-style**

## All users
Below actions are related to all playwright-bdd users.

### Update packages
Remove `@cucumber/cucumber` and update `playwright-bdd`:
```
npm un @cucumber/cucumber
npm i -D playwright-bdd@latest
```

### New `steps` option
Starting from version 7, it's recommended to use the all-in-one `steps` option instead of Cucumber's `require` and `import` options. This `steps` option is a glob pattern that searches for step definition files and can be defined as a string or an array of strings. A key change from the previous behavior is that there is **no default location** for these files, unlike [in Cucumber](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-code). So, if your configuration relies on the default location, you'll need to explicitly set the `steps` path.

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

> `require` and `import` options are still allowed in BDD configuration, but under the hood they are converted into `steps` and will be removed in the future.

### New `features` option
It's recommended to use new `features` option instead of `paths`. The behavior of `features` is the same except there is **no default location** for feature files, unlike [in Cucumber](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md#finding-your-features). If your config relies on the default location, please set features path explicitly.

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

> `paths` option is still allowed in BDD configuration, but under the hood it is converted into `features` and will be removed in the future.

### Omit `importTestFrom`
Since v7 config option `importTestFrom` can be omitted in most cases. Now playwright-bdd automatically checks step definitions and detects optimal file to import test from. The only requirement - you should include fixture files in `steps` option.

Before:
```ts
const testDir = defineBddConfig({
  importTestFrom: 'steps/fixtures.ts',
  steps: ['steps/steps.ts'],
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

> `importTestFrom` can be still used for some specific cases. If you have such case, feel free to share it in issues, we can try to improve the algorithm.

### Cucumber config
Before v7, if there was `cucumber.js` file, it was loaded and merged into BDD configuration. Now `cucumber.js` is not loaded anymore. Single source of options is `defineBddConfig()` in `playwright.config.ts`. 

> If you need Cucumber option that is not supported, feel free to request it in [issues](https://github.com/vitalets/playwright-bdd/issues).

### Snippets
Before v7, you could configure [snippets](https://github.com/cucumber/cucumber-js/blob/main/docs/snippets.md) via Cucumber options `snippetInterface` / `snippetSyntax`. Now these options are dropped from BDD configuration. Playwright-bdd automatically detects style of your steps (playwright-style / cucumber-style / decorators) and shows proper syntax for missing steps.

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

### Custom parameter types
- `defineParameterType` should be imported from `playwright-bdd` instead of `@cucumber/cucumber`
- `defineParameterType` is now supported in decorator steps! 

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

### ESM
ESM projects can be executed without `--loader=ts-node/esm` (since Playwright 1.41)

Before:
```
npx cross-env NODE_OPTIONS="--loader=ts-node/esm --no-warnings" bddgen && npx playwright test
```
Since v7:
```
npx bddgen && npx playwright test
```

### DataTable
`DataTable` should be imported from `playwright-bdd` instead of `@cucumber/cucumber`.

Before:
```ts
import { DataTable } from '@cucumber/cucumber';
```
Since v7:
```ts
import { DataTable } from 'playwright-bdd';
```

### Other changes
* minimal Playwright version increased to **v1.35**
* minimal Node.js version increased to **v18**

## Actions for Cucumber-style
Cucumber-style steps require some additional actions due to `@cucumber/cucumber` removal.

### Given / When / Then import
Before v7, `Given / When / Then` for cucumber-style were imported directly from `@cucumber/cucumber` package. Now these functions should be created from `createBdd()` similar to Playwright-style steps. The only difference - you should pass extra option (will be covered below).

Before:

```ts
import { Given, When, Then } from '@cucumber/cucumber';

Given('I am on home page', async function () {
  await this.page.goto('/');
});
```
Since v7:

**fixtures.ts**
```ts 
import { test as base, createBdd } from 'playwright-bdd';

// define simplest world (see the next section for more details)
type World  = { page: Page };

export const test = base.extend<{ world: World }>({
  world: async ({ page }, use) => {
    const world = { page };
    await use(world);
  },
});

export const { Given, When, Then } = createBdd(test, { 
  worldFixture: 'world' 
});
```

**steps.ts**
```ts
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  await this.page.goto('/');
});
```

> Check-out full Cucumber-style example in [examples/cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).

### Cucumber world
Since v7 there is no built-in `World`. If you need world for cucumber-style steps, you define it from scratch as a Playwright fixture. You are not restricted to inherit world from some base class. Then you pass the name of world's fixture to `createBdd` and get `Given / When / Then` bound to that world.

Example:

1. **world.ts** - create world

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

2. **fixtures.ts** - wrap world into Playwright fixture and bind to `Given / When / Then`

```ts
import { test as base, createBdd } from 'playwright-bdd';
import { MyWorld } from './world';

export const test = base.extend<{ myWorld: MyWorld }>({
  myWorld: async ({ page }, use, testInfo) => use(new MyWorld(page, testInfo));
});

export const { Given, When, Then } = createBdd(test, { 
  worldFixture: 'myWorld' // <- provide the name of world's fixture
});
```

3. **steps.ts** - write steps using world as `this`

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

### Can I get previous BddWorld in v7?
Yes. The previous `BddWorld` is extracted into a separate file [bddWorld.ts](https://github.com/vitalets/playwright-bdd/blob/v7/test/bdd-world-extracted/steps/bddWorld.ts). You can copy/paste it and tune later for your needs. Once copied, check-out [fixtures.ts](https://github.com/vitalets/playwright-bdd/blob/v7/test/bdd-world-extracted/steps/fixtures.ts) how to initialize BddWorld in your code.

?> If you've found some mistake / missing items in this guide, feel free to open [an issue](https://github.com/vitalets/playwright-bdd/issues) on GitHub
