# Passing data between scenarios

!> Please note that serial mode **is not recommended** by the Playwright team

When using Playwright's [serial mode](https://playwright.dev/docs/test-parallel#serial-mode) you may need to pass data between scenarios within feature file.

The approach is similar to [passing data between steps](writing-steps/passing-data-between-steps.md).
You create a context variable, write to it in one scenario and read in another.
The only difference is that context variable exists in the global scope and holds a mapping of context to feature file.

Let's take an example - share the same `page` instance between scenarios in a file. You can login user in the first scenario and then run all checks in the subsequent scenarios:

```gherkin
@mode:serial
Feature: My feature

  Scenario: Authenticate
    Given I am logged in as "user1"

  Scenario: Check profile
    # still in the same page with the same context!
    When I open profile page
    Then I see name "user1"
```

#### Implementation
The implementation uses two fixtures:

- test-scoped `ctx`: holds context for the current file
- worker-scoped `ctxMap`: holds a map of all contexts and files in a worker

```ts
import { test as base, createBdd } from 'playwright-bdd';

// context shared between scenarios in a file
type Ctx = { page: Page };

export const test = base.extend<{ ctx: Ctx }, { ctxMap: Record<string, Ctx> }>({
  ctx: async ({ ctxMap }, use, testInfo) => {
    // get or init a context for the current file
    ctxMap[testInfo.file] = ctxMap[testInfo.file] || {};
    // pass context to scenarios as a `ctx` fixture
    await use(ctxMap[testInfo.file]);
  },
  ctxMap: [async ({}, use) => {
    const ctxMap: Record<string, Ctx> = {};
    await use(ctxMap);
    // cleanup all contexts on worker teardown
    for (const ctx of Object.values(ctxMap)) await ctx.page?.close();
  }, { scope: 'worker' }],
});

export const { Given, When, Then } = createBdd(test);
```

#### Usage
Now you can use `ctx` fixture in steps, it will persist between scenarios:

```ts
import { Given, When, Then } from "./fixtures";

Given("I am logged in as {string}", async ({ ctx, browser }, user: string) => {
  ctx.page = await browser.newPage();
  // ...perform login for user
});

When("I open profile page", async ({ ctx }) => {
  await ctx.page.getByRole("link", { name: "Profile" }).click();
});

Then("I see name {string}", async ({ ctx }, user: string) => {
  await expect(ctx.page.getByRole("header")).toContainText(user);
});
```

Note that steps do not use Playwright's built-in `page` fixture, as it is re-created for every scenario.