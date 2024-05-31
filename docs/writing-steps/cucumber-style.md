# Cucumber-style steps

?> This is a new approach for cucumber-style steps, for old one please check [cucumber-style (legacy)](writing-steps/cucumber-style-legacy.md)

Cucumber-style step definitions are compatible with CucumberJS.

The key point is that step definitions use World (`this`) to access Playwright APIs.
In terms of Playwright, World is just a test-scoped fixture, that is automatically provided to all step definitions.

In this new approach, you can define World in a free form, without extending Cucumber World / BddWorld. The shape of world is up to you, you can pass any fixtures and use them in step definitions.

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

> There is also no need to call `setWorldConstructor` like for [CucumberJs custom world](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md#custom-worlds).

2. Provide world to test as Playwright fixture:

```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: ({ page }, use) => use(new World(page)),
});
```

3. Export `Given / When / Then` functions via `createBdd()` (notice `worldFixture` parameter):

```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';
import { World } from './world';

export const test = base.extend<{ world: World }>({
  world: ({ page }, use) => use(new World(page)),
});

export const { Given, When, Then } = createBdd(test, { worldFixture: 'world' });
```

4. Use these `Given / When / Then` to define steps, world instance is accessible as `this`:

```ts
// steps.ts
import { Given, When, Then } from './fixtures';

Given('I am on home page', async function () {
  await this.openHomePage();
});
```

See [full example of Cucumber-style](https://github.com/vitalets/playwright-bdd/tree/main/examples/cucumber-style).
