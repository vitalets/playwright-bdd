# Passing data between steps

When writing BDD steps, you often need to pass data from one step to another.

For example, in one step you click the link, and in another you want to check that new tab is opened:

```gherkin
Feature: home page

  Scenario: check link
    When I click the link
    Then new tab is opened
```

Typically, in Cucumber a `world` is used as a container for such data. World is created for each scenario and persists between all steps. One step can write data to the `world` object, and another can read from it.

In Playwright, any test-scoped fixture can be used as a cross-step context. You can name it `ctx` (for brevity) and initialize with empty object `{}`. For example:

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

When('new tab is opened', async ({ ctx }) => {
  const newTab = await ctx.newTapPromise;
  await expect(newTab).toHaveTitle(/.*checkout/);
});
```

**For TypeScript users**: you can define type of `ctx` as `Record<string, any>` or make it more strict:

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

In Cucumber-style and decorator steps, use `this` to write and read data between steps, similar to previous example.

?> Check out [API testing](https://github.com/vitalets/playwright-bdd/tree/main/examples/api-testing) example that uses cross-step data as well
