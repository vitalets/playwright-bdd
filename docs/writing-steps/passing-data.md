# Passing data between steps

When writing BDD steps, you often need to pass data from one step to another.

For example, in one step you click the link, and in another you want to check that a new tab is opened:

```gherkin
Feature: home page

  Scenario: check link
    When I click the link
    Then new tab is opened
```

In Cucumber, a `world` is used as a container for such data. The world is created for each scenario and persists between all steps. One step can write data to the `world` object, and another can read from it.

In Playwright, any [test-scoped fixture](https://playwright.dev/docs/test-fixtures#creating-a-fixture) can be used as a cross-step context. You can name it `ctx` (for brevity) and initialize it with an empty object `{}`. For example:

```js
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({
  ctx: async ({}, use) => {
    const ctx = {};
    await use(ctx);
  },
});

export const { Given, When, Then } = createBdd(test);
```

Now you can use `ctx` in steps to read and write data:

```js
import { Given, When, Then } from './fixtures';

When('I click the link', async ({ page, ctx }) => {
  ctx.newTapPromise = context.waitForEvent('page');
  await page.getByRole('link').click();
});

Then('new tab is opened', async ({ ctx }) => {
  const newTab = await ctx.newTapPromise;
  await expect(newTab).toHaveTitle(/.*checkout/);
});
```

?> Check out the [API testing](https://github.com/vitalets/playwright-bdd/tree/main/examples/api-testing) example as a show case of cross-step data passing.

#### For TypeScript users

You can define the type of `ctx` as `Record<string, any>` or make it more strict:

```ts
type Ctx = {
  newTapPromise: Promise<Page> 
};

export const test = base.extend<{ ctx: Ctx }>({
  ctx: async ({}, use) => {
    const ctx = {} as Ctx;
    await use(ctx);
  },
});

export const { Given, When, Then } = createBdd(test);
```

#### Cucumber-style
In Cucumber-style steps, use `this` to write and read data between steps:

```js
import { Given, When, Then } from './fixtures';

When('I click the link', async function () {
  this.newTapPromise = this.context.waitForEvent('page');
  await this.page.getByRole('link').click();
});

Then('new tab is opened', async function () {
  const newTab = await this.newTapPromise;
  await expect(newTab).toHaveTitle(/.*checkout/);
});
```
