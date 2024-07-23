# Hooks

Hooks are functions that automatically run before/after some parts of test execution:

* `BeforeAll` / `AfterAll` - run before/after **every worker**
* `Before` / `After` - run before/after **every scenario**

> If you need to run some code **before/after overall test execution**, use Playwright's [global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown)

## Fixtures

Although hooks is a well-known concept, Playwright offers a better alternative - [fixtures](https://playwright.dev/docs/test-fixtures#introduction). In most cases fixtures can fully replace hooks and provide [many advantages](https://playwright.dev/docs/test-fixtures#with-fixtures). By default always consider to use fixtures.

🔹 **Example of rewriting code from hooks to fixtures**

Imagine a scenario with a step that requires user authorization:
```feature
Feature: Some feature

    Scenario: Some scenario
        Given I am an authorized user
```
So we need to wrap scenario with sign-in / sign-out actions.

**In Cucumber** I can add some tag (e.g. `@auth`) to that scenario:
```feature
Feature: Some feature

    @auth
    Scenario: Some scenario
        Given I am an authorized user
```
And register `Before / After` hooks to run for that tag:

```ts
Before({ tags: '@auth' }, async function () {
  // do sign-in
});

After({ tags: '@auth' }, async function () {
  // do sign-out
});
```

**In Playwright** I can solve it with the following `auth` fixture:
```ts
export const test = base.extend({
  auth: async ({}, use) => {
    // do sign-in
    await use({ username: 'some user' });
    // do sign-out
  }
});
```
Now I just reference `auth` fixture in the step:
```ts
Given('I am an authorized user', async ({ auth }) => {
  console.log('step for authorized user', auth.username);
});
```

The benefits of using `auth` fixture:
- no extra tags
- automatically skipped when authorization is not needed
- reusable in other features 

## BeforeAll / AfterAll

> Consider using [fixtures](#fixtures) instead of hooks.

`playwright-bdd` supports worker-level `BeforeAll / AfterAll` hooks similar to [Cucumber hooks](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md#beforeall--afterall).

Usage:
```ts
import { createBdd } from 'playwright-bdd';

const { BeforeAll, AfterAll } = createBdd();

BeforeAll(async function ({ $workerInfo, browser }) {
  // runs when each worker starts
});

AfterAll(async function ({ $workerInfo, browser }) {
  // runs when each worker ends
});
```

You can set **timeout** for each hook as well as in Cucumber:
```ts
BeforeAll({ timeout: 1000 }, async function () {
  // runs with timeout 1000 ms
});

AfterAll({ timeout: 1000 }, async function () {
  // runs with timeout 1000 ms
});
```

Hook function accepts **1 argument** - [worker scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures).
You can access [$workerInfo](https://playwright.dev/docs/api/class-workerinfo) and any built-in or custom fixtures.

> This behavior differs from Cucumber where `BeforeAll / AfterAll` can only accept *callback* parameter.

🔹 **Example of using custom fixture in `BeforeAll` hook**

Imagine you have defined custom worker fixture `myWorkerFixture`:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{}, { myWorkerFixture: MyWorkerFixture }>({
  myWorkerFixture: [async ({ browser }, use) => {
    const fixture = new MyWorkerFixture(browser);
    await fixture.setup();
    await use(fixture);
  }, { scope: 'worker' }]
});
```

Now you can pass `test` instance to `createBdd()` and use `myWorkerFixture` in the produced hooks:
```ts
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { BeforeAll, AfterAll } = createBdd(test);

BeforeAll(async function ({ myWorkerFixture }) {
  // ...
});
```

> Note that there is **no access to World** in `BeforeAll / AfterAll` hooks because World is re-created for every test. Here is a [discussion](https://github.com/cucumber/cucumber-js/issues/1393) in Cucumber repo.

## Before / After

> Consider using [fixtures](#fixtures) instead of hooks.

`playwright-bdd` supports scenario-level `Before / After` hooks similar to [Cucumber hooks](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md#hooks).

Usage:
```ts
import { createBdd } from 'playwright-bdd';

const { Before, After } = createBdd();

Before(async function () {
  // runs before each scenario, you can access to World as 'this'
});

After(async function () {
  // runs after each scenario, you can access to World as 'this'.
});
```

You can set **tags** and **timeout** for each hook as well as in Cucumber:
```ts
Before({ tags: '@mobile and not @slow', timeout: 1000 }, async function () {
  // runs for scenarios with @mobile and not @slow tags
});

After({ tags: '@mobile and not @slow', timeout: 1000 }, async function () {
  // runs for scenarios with @mobile and not @slow tags
});
```

If you want to pass only tags, you can use a shortcut:
```ts
Before('@mobile and not @slow', async function () {
  // ...
});
```

Hook function can accept **1 argument** - [test-scoped fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures).
You can access [$testInfo](https://playwright.dev/docs/api/class-testinfo), [$tags](writing-steps/playwright-style.md#tags) and any built-in or custom fixtures. 

> This behavior differs from Cucumber where `Before / After` accepts [another object](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/api_reference.md#afteroptions-fn) as a first argument.

🔹 **Example of using custom fixture in `Before` hook**

Imagine you have defined custom fixture `myFixture`:
```ts
import { test as base } from 'playwright-bdd';

export const test = base.extend<{ myFixture: MyFixture }>({
  myFixture: async ({ page }, use) => {
    const fixture = new MyFixture(page);
    await use(fixture);
  }
});
```

Now you can pass `test` instance to `createBdd()` and use `myFixture` in the produced hooks:
```ts
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Before, After } = createBdd(test);

Before(async function ({ myFixture }) {
  // ...
});
```
