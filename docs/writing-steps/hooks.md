# Hooks

Hooks are functions that automatically run before/after workers or scenarios:

* `BeforeWorker / BeforeAll` - runs **once in each worker**, before all scenarios
* `AfterWorker / AfterAll` - runs **once in each worker**, after all scenarios
* `BeforeScenario / Before` - runs **before each scenario**
* `AfterScenario / After` -  runs **after each scenario**
* `BeforeStep` - runs **before each step**
* `AfterStep` -  runs **after each step**

> If you need to run some code **before/after overall test execution**, check out Playwright's [project dependencies](https://playwright.dev/docs/test-global-setup-teardown#option-1-project-dependencies) or [global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown)

## Fixtures

Although hooks are a well-known concept, Playwright offers a better alternative - [fixtures](https://playwright.dev/docs/test-fixtures#introduction). In most cases, fixtures can fully replace hooks and provide [many advantages](https://playwright.dev/docs/test-fixtures#with-fixtures). By default, always consider using fixtures.

#### Example of rewriting code from hooks to fixtures

Imagine a scenario with a step that requires user authorization:
```gherkin
Feature: Some feature

    Scenario: Some scenario
        Given I am an authorized user
```
So we need to wrap the scenario with sign-in / sign-out actions.

**In Cucumber** you can add a tag (e.g. `@auth`) to that scenario:
```gherkin
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

**In Playwright** you can create the following `auth` fixture:
```ts
export const test = base.extend({
  auth: async ({}, use) => {
    // do sign-in
    await use({ username: 'some user' });
    // do sign-out
  }
});
```
and use that `auth` fixture in the step:
```ts
Given('I am an authorized user', async ({ auth }) => {
  console.log('step for authorized user', auth.username);
});
```
Playwright will automatically wrap test code with user sign-in and sign-out.

The benefits of using fixtures:
- fixture is executed only when actually used
- no extra tags
- fixture code is reusable in other features 

## BeforeWorker / BeforeAll

> Consider using [fixtures](#fixtures) instead of hooks.

Playwright-BDD supports the worker-level hook `BeforeWorker` (aliased as `BeforeAll`). It runs **once in each worker, before all scenarios**. 

?> Although `BeforeAll` is a more used name, `BeforeWorker` better expresses when the hook runs.

#### Usage

1. Create and export `BeforeWorker` function:

    ```ts
    // fixtures.ts
    import { test as base, createBdd } from 'playwright-bdd';

    export const test = base.extend({ /* ...your fixtures */ });

    export const { BeforeWorker } = createBdd(test);
    ```

2. Define hooks:

    ```ts
    // hooks.ts
    import { BeforeWorker } from './fixtures';

    BeforeWorker(async ({ $workerInfo, browser }) => {
      // ...this code runs once in each worker and uses worker-scoped fixtures
    });
    ```

Since Playwright-BDD **v8** you can bind worker hook to particular features by `tags`:

```ts
BeforeWorker({ tags: '@auth' }, async () => { ... });
```

This effectively works like a **BeforeFeature** hook.

You can also provide default tags via `createBdd()`:
```ts
const { BeforeWorker } = createBdd(test, { tags: '@mobile' });

BeforeWorker(async () => {
  // runs only for features with @mobile 
});
```

Additionally, you can set `name` and `timeout` for the hook:
```ts
BeforeWorker({ name: 'setup database', timeout: 1000 }, async () => {
  // runs with timeout 1000 ms
});
```

The hook function accepts **1 argument** - [worker scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures).
You can access [$workerInfo](https://playwright.dev/docs/api/class-workerinfo) and any built-in or custom fixtures. See more details in [BeforeWorker / BeforeAll API](api.md#beforeworker-beforeall).

#### Example of using `BeforeWorker` with custom fixture

Imagine you have defined a custom worker fixture `myWorkerFixture`:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{}, { myWorkerFixture: MyWorkerFixture }>({
  myWorkerFixture: [async ({}, use) => {
    // ... setup myWorkerFixture
  }, { scope: 'worker' }]
});

export const { BeforeWorker } = createBdd(test);
```

Now you can use `myWorkerFixture` in the produced hooks:
```ts
import { BeforeWorker } from './fixtures';

BeforeWorker(async ({ myWorkerFixture }) => {
  // ... use myWorkerFixture in hook
});
```

> Note that there is **no access to World** in `BeforeWorker / AfterWorker` hooks because World is re-created for every test. Here is a [discussion](https://github.com/cucumber/cucumber-js/issues/1393) in the Cucumber repo.

?> If you need to run hook **once for all workers**, check out [Running hook once](#running-hook-once).

## AfterWorker / AfterAll

> Consider using [fixtures](#fixtures) instead of hooks.

Playwright-BDD supports the worker-level hook `AfterWorker` (aliased as `AfterAll`).
It runs **once in each worker, after all scenarios**. 

?> Although `AfterAll` is a more used name, `AfterWorker` better expresses when the hook runs.

Usage:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...your fixtures */ });

const { AfterWorker } = createBdd(test);

AfterWorker(async ({ $workerInfo, browser }) => {
  // runs when each worker ends
});
```

All options and behavior are similar to [BeforeWorker / BeforeAll](#beforeworker-beforeall).

## BeforeScenario / Before

> Consider using [fixtures](#fixtures) instead of hooks.

Playwright-BDD supports the scenario-level hook `BeforeScenario` (aliased as `Before`). It runs **before each scenario**. 

?> Although `Before` is a more used name, `BeforeScenario` better expresses when the hook runs.



#### Usage

1. Create and export `BeforeScenario` function:

    ```ts
    // fixtures.ts
    import { test as base, createBdd } from 'playwright-bdd';

    export const test = base.extend({ /* ...your fixtures */ });

    export const { BeforeScenario } = createBdd(test);
    ```

2. Define scenario hooks:

    ```ts
    // hooks.ts
    import { BeforeScenario } from './fixtures';

    BeforeScenario(async () => {
      // runs before each scenario
    });
    ```

Since Playwright-BDD **v8** you can target scenario hook to particular features/scenarios by `tags`:

```ts
BeforeScenario({ tags: '@mobile and not @slow' }, async () => {
  // runs before scenarios with @mobile and not @slow tags
});
```

If you want to pass only tags, you can use a shortcut:
```ts
BeforeScenario('@mobile and not @slow', async () => {
  // runs for scenarios with @mobile and not @slow
});
```

You can also provide default tags via `createBdd()`:
```ts
const { BeforeScenario } = createBdd(test, { tags: '@mobile' });

BeforeScenario(async () => {
  // runs only for scenarios with @mobile 
});
```

If the hook has both default and own tags, they are combined using `AND` logic:
```ts
const { BeforeScenario } = createBdd(test, { tags: '@mobile' });

BeforeScenario({ tags: '@slow' }, async function () {
  // runs for scenarios with @mobile and @slow
});
```

Additionally, you can set `name` and `timeout` for the hook:
```ts
BeforeScenario({ name: 'my hook', timeout: 5000 }, async function () {
  // ...
});
```

The hook function accepts **1 argument** - [test-scoped fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures). You can access [$testInfo](https://playwright.dev/docs/api/class-testinfo), [$tags](writing-steps/bdd-fixtures.md#tags) and any built-in or custom fixtures. See more details in [BeforeScenario / Before API](api.md#beforescenario-before).

#### Example of using `BeforeScenario` with custom fixture

Imagine you have defined a custom fixture `myFixture`:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ myFixture: MyFixture }>({
  myFixture: async ({ page }, use) => { // <-- custom fixture
    // ...
  }
});

export const { BeforeScenario } = createBdd(test);
```

Now you can use `myFixture` in the produced hooks:
```ts
import { BeforeScenario } from './fixtures';

BeforeScenario(async ({ myFixture }) => {
  // ... use myFixture in the hook
});
```

## AfterScenario / After

> Consider using [fixtures](#fixtures) instead of hooks.

Playwright-BDD supports the scenario-level hook `AfterScenario` (aliased as `After`). It runs **after each scenario**. 

?> Although `After` is a more used name, `AfterScenario` better expresses when the hook runs.

Usage:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...your fixtures */ });

const { AfterScenario } = createBdd(test);

AfterScenario(async () => {
  // runs after each scenario
});
```

All options and behavior are similar to [BeforeScenario / Before](#beforescenario-before).

## BeforeStep

Playwright-BDD supports the step-level hook `BeforeStep`. It runs **before each step**. 

Usage:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...your fixtures */ });

const { BeforeStep } = createBdd(test);

BeforeStep(async () => {
  // runs before each step
});
```

You can target step hook to the steps of the specific feature/scenario by `tags`:

```ts
BeforeStep({ tags: '@mobile and not @slow' }, async function () {
  // runs for scenarios with @mobile and not @slow
});
```
If you want to pass only tags, you can use a shortcut:
```ts
BeforeStep('@mobile and not @slow', async function () {
  // runs for scenarios with @mobile and not @slow
});
```
You can also provide default tags via `createBdd()`:
```ts
const { BeforeStep } = createBdd(test, { tags: '@mobile' });

BeforeStep(async () => {
  // runs only for scenarios with @mobile 
});
```

If the hook has both default and own tags, they are combined using `AND` logic:
```ts
const { BeforeStep } = createBdd(test, { tags: '@mobile' });

BeforeStep({ tags: '@slow' }, async function () {
  // runs for scenarios with @mobile and @slow
});
```

Additionally, you can set `name` and `timeout` for the hook:
```ts
BeforeStep({ name: 'my hook', timeout: 5000 }, async function () {
  // ...
});
```

The hook function accepts **1 argument** - [test-scoped fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures). You can access [$testInfo](https://playwright.dev/docs/api/class-testinfo), [$tags](writing-steps/bdd-fixtures.md#tags) and any built-in or custom fixtures. See more details in [BeforeScenario / Before API](api.md#beforescenario-before).

## AfterStep

> Consider using [fixtures](#fixtures) instead of hooks.

Playwright-BDD supports the scenario-level hook `AfterStep`. It runs **after each step**. 

Usage:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend({ /* ...your fixtures */ });

const { AfterStep } = createBdd(test);

AfterStep(async () => {
  // runs after each scenario
});
```

All options and behavior are similar to [BeforeStep](#beforestep).

#### Example of using `AfterStep` to capture screenshot after each step

Create `fixtures.ts`:
```ts
export const { AfterStep } = createBdd(test);
```

Import `fixtures.ts` in step definition
```ts
import { AfterStep } from './fixtures';

AfterStep(async ({ page, $testInfo, $step }) => {
  await $testInfo.attach(`screenshot after ${$step.title}`, {
    contentType: 'image/png',
    body: await page.screenshot()
  });
});

// ...rest of the step definitions
```

## Running hook once

`BeforeAll` / `AfterAll` run **once per worker**, not once for the entire test run. This may not be what you want. For example, if you populate a database with test data, there’s no need to repopulate it in every worker:

```ts
import { BeforeWorker } from './fixtures';

BeforeWorker(async () => {
  await populateDatabase(); // <-- runs in every worker
});
```

To run code inside a hook exactly once, you can use [@vitalets/global-cache](https://github.com/vitalets/global-cache). It lets you cache and reuse any serializable data across all workers:

```ts
import { BeforeWorker } from './fixtures';
import { globalCache } from '@vitalets/global-cache';

BeforeWorker(async () => {
  await globalCache.get('populate-db', async () => {
    await populateDatabase(); // <-- runs once
  });
});
```

> See the global-cache [README](https://github.com/vitalets/global-cache) for setup instructions.

You can also use this approach in `BeforeScenario` hooks to store data and [reuse](writing-steps/passing-data-between-steps.md) it in steps:

```ts
BeforeScenario(async ({ ctx }) => {
  ctx.userIds = await globalCache.get('user-ids', async () => {
    const userIds = await populateDatabase();
    return userIds;
  });
});
```

You can use the global cache in fixtures as well. For example, wrap the code in `storageState` fixture to authenticate only when needed and cache for 1 hour:

```ts
// fixtures.ts
import { test as base, createBdd } from 'playwright-bdd';
import { globalCache } from '@vitalets/global-cache';

export const test = base.extend({
  storageState: async ({ storageState, browser }, use, testInfo) => {
    // Skip authentication for scenarios tagged @no-auth
    if (testInfo.tags.includes('@no-auth')) return use(storageState);

    // Get auth state once and cache it for 1 hour
    const authState = await globalCache.get('auth-state', { ttl: '1 hour' }, async () => {
      const loginPage = await browser.newPage();
      // ...authenticate
      return loginPage.context().storageState();
    });

    await use(authState);
  },
});

export const { Given, When, Then } = createBdd(test);
```

This can significantly speed up your tests in fully parallel and sharded runs.