# Cucumber-style steps

?> This is a new approach for cucumber-style steps since **v7**. For versions **before v7** please check [cucumber-style (legacy)](writing-steps/cucumber-style-legacy.md)

Cucumber-style step definitions are compatible with CucumberJS.

 * step definitions use World (`this`) to interact with browser
 * step definitions receive only step parameters, don't receive custom fixtures as a first parameter
 * step definitions can't be defined as arrow functions

Comparison of Cucumber-style and Playwright-style step:
```ts
// Cucumber-style step
Given('I open page {string}', async function (url: string) {
  await this.page.goto(url);
});

// Playwright-style step
Given('I open page {string}', async ({ page }, url: string) => {
  await page.goto(url);
});
```

In terms of Playwright, World is just a test-scoped fixture, that is automatically provided to all step definitions.

Since `playwright-bdd` v7 you can define World in a free form, without extending Cucumber World / BddWorld. The shape of world is up to you, you can pass any fixtures and use them in step definitions.

**Example of cucumber-style setup:**

1. Define World:

```ts
// world.ts
import { Page } from '@playwright/test';

export class World {
  constructor(public page: Page) {}

  async openHomePage() {
    await this.page.goto('https://playwright.dev');
  }
}
```

> No need to call `setWorldConstructor` as it was before for [CucumberJs custom world](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md#custom-worlds).

2. Extend Playwright's test with world fixture and create `Given / When/ Then`:

```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: ({ page }, use) => use(new World(page)),
});

export const { Given, When, Then } = createBdd(test, { 
  worldFixture: 'world' 
});
```

> Make sure to export `test` instance, because it is used in generated test files

3. Use these `Given / When / Then` to define steps, world instance is available as `this`:

```ts
// steps.ts
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  await this.openHomePage();
});
```

See [full example of Cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).

### Provide custom fixtures
You can provide custom fixtures to cucumber-style steps.
To achieve that, assign custom fixture to a property of World object 
and then access it via `this`:

```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';

type World = {
  page: Page;
  myFixture: MyFixture; // <- custom fixture property in World
};

export const test = base.extend<{ world: World }>({
  myFixture: ({}, use) => {
    // setup myFixture
  },
  world: ({ page, myFixture }, use) => {
    const world: World = { page, myFixture };
    use(world);
  },
});

export const { Given, When, Then } = createBdd(test, { 
  worldFixture: 'world' 
});
```

Use `this.myFixture` in step definitions:
```ts
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  console.log(this.myFixture);
});
```

### Is there default world?
No. You define entire World yourself, providing only necessary fixtures.

In the simplest case you can create a world with only `page` property:
```js
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  world: ({ page }, use) => use({ page }),
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
```