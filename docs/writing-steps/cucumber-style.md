# Cucumber-style steps

Cucumber-style step definitions are compatible with [CucumberJS](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/step_definitions.md).

 * step definitions use World (`this`) to interact with the browser
 * step definitions receive only step parameters, don't receive custom fixtures as a first argument
 * step definitions can't be defined as arrow functions

In terms of Playwright, World is just a test-scoped fixture, that is automatically provided to all step definitions.

Since **Playwright-BDD v7** you can define World as a custom class, without extending Cucumber World. The shape of World is up to you, you can pass any fixtures as world properties and use them later in step definitions.

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

2. Extend Playwright test with `world` fixture and create `Given / When / Then`:

```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: async ({ page }, use) => {
    const world = new World(page);
    await use(world);
  },
});

export const { Given, When, Then, Before, After } = createBdd(test, { 
  worldFixture: 'world' 
});
```

> Make sure to export the `test` instance, because it is used in the generated test files

3. Use these `Given / When / Then` to define steps, the world instance is available as `this`:

```ts
// steps.ts
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  await this.openHomePage();
});
```

See the [full example of Cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).

### Custom fixtures
You can provide custom fixtures to cucumber-style steps.
To achieve that, assign a custom fixture to a property of the World object 
and then access it via `this`:

```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';

type World = {
  page: Page;
  myFixture: MyFixture; // <- custom fixture property
};

export const test = base.extend<{ world: World }>({
  myFixture: async ({}, use) => {
    // setup myFixture...
  },
  world: async ({ page, myFixture }, use) => {
    const world: World = { page, myFixture };
    await use(world);
  },
});

export const { Given, When, Then, Before, After } = createBdd(test, { 
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
No. You define entire World from scratch.

In the simplest case you can create a world as a plain object with `page` property:
```js
import { test as base } from 'playwright-bdd';

export const test = base.extend({
  world: async ({ page }, use) => {
    const world = { page };
    await use(world);
  },
});

export const { Given, When, Then, Before, After } = createBdd(test, { worldFixture: 'world' });
```