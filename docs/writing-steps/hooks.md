# Hooks

Hooks are functions that automatically run before/after workers or scenarios:

* `BeforeWorker / BeforeAll` - runs **once in each worker**, before all scenarios
* `AfterWorker / AfterAll` - runs **once in each worker**, after all scenarios
* `BeforeScenario / Before` - runs **before each scenario**
* `AfterScenario / After` -  runs **after each scenario**

> If you need to run some code **before/after overall test execution**, check out Playwright's [project dependencies](https://playwright.dev/docs/test-global-setup-teardown#option-1-project-dependencies) or [global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown#option-2-configure-globalsetup-and-globalteardown)

## Fixtures

Although hooks is a well-known concept, Playwright offers a better alternative - [fixtures](https://playwright.dev/docs/test-fixtures#introduction). In most cases fixtures can fully replace hooks and provide [many advantages](https://playwright.dev/docs/test-fixtures#with-fixtures). By default always consider using fixtures.

#### Example of rewriting code from hooks to fixtures

Imagine a scenario with a step that requires user authorization:
```gherkin
Feature: Some feature

    Scenario: Some scenario
        Given I am an authorized user
```
So we need to wrap scenario with sign-in / sign-out actions.

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

The benefits of using fixture:
- fixture is executed only when actually used
- no extra tags
- fixture code is reusable in other features 

## BeforeWorker / BeforeAll

Playwright-bdd supports worker-level hook `BeforeWorker` (aliased as `BeforeAll`). It runs **once in each worker, before all scenarios**. 

?> Although `BeforeAll` is more used name, `BeforeWorker` better expresses when the hook runs.

Usage:
```ts
import { createBdd } from 'playwright-bdd';

const { BeforeWorker } = createBdd();

BeforeWorker(async ({ $workerInfo, browser }) => {
  // runs when each worker starts
});
```

Since playwright-bdd **v8** you can use **tags** to target worker hook to particular features:

```gherkin
@auth
Feature: Some feature

    Scenario: Some scenario
        Given I am an authorized user
```
Hook that runs only before auth feature:
```ts
BeforeWorker({ tags: '@auth' }, async () => { ... });
```
This effectively works like **BeforeFeature** hook.

Additionally, you can set `name` and `timeout` for the hook:
```ts
BeforeWorker({ name: 'setup database', timeout: 1000 }, async () => {
  // runs with timeout 1000 ms
});
```

Hook function accepts **1 argument** - [worker scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures).
You can access [$workerInfo](https://playwright.dev/docs/api/class-workerinfo) and any built-in or custom fixtures. See more details in [BeforeWorker / BeforeAll API](api.md#beforeworker-beforeall).

#### Example of using custom fixture in `BeforeWorker` hook

Imagine you have defined worker fixture `myWorkerFixture`:
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

> Note that there is **no access to World** in `BeforeWorker / AfterWorker` hooks because World is re-created for every test. Here is a [discussion](https://github.com/cucumber/cucumber-js/issues/1393) in Cucumber repo.

## AfterWorker / AfterAll

Playwright-bdd supports worker-level hook `AfterWorker` (aliased as `AfterAll`).
It runs **once in each worker, after all scenarios**. 

?> Although `AfterAll` is more used name, `AfterWorker` better expresses when the hook runs.

Usage:
```ts
import { createBdd } from 'playwright-bdd';

const { AfterWorker } = createBdd();

AfterWorker(async ({ $workerInfo, browser }) => {
  // runs when each worker ends
});
```

For other options please see [BeforeWorker / BeforeAll](#beforeworker-beforeall) section.

## BeforeScenario / Before

Playwright-bdd supports scenario-level hook `BeforeScenario` (aliased as `Before`). It runs **before each scenario**. 

?> Although `Before` is more used name, `BeforeScenario` better expresses when the hook runs.

Usage:
```ts
import { createBdd } from 'playwright-bdd';

const { BeforeScenario } = createBdd();

BeforeScenario(async () => {
  // runs before each scenario
});
```
You can use `tags` to target hook to particular features/scenarios:
```ts
BeforeScenario({ tags: '@mobile and not @slow' }, async function () {
  // runs for scenarios with @mobile and not @slow tags
});
```
If you want to pass only tags, you can use a shortcut:
```ts
BeforeScenario('@mobile and not @slow', async function () {
  // ...
});
```

Additionally, you can set `name` and `timeout` for the hook:
```ts
BeforeScenario({ name: 'my hook', timeout: 5000 }, async function () {
  // ...
});
```

Hook function can accept **1 argument** - [test-scoped fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures).
You can access [$testInfo](https://playwright.dev/docs/api/class-testinfo), [$tags](writing-steps/playwright-style.md#tags) and any built-in or custom fixtures. See more details in [BeforeScenario / Before API](api.md#beforescenario-before).

#### Example of using custom fixture in `BeforeScenario` hook

Imagine you have defined custom fixture `myFixture`:
```ts
import { test as base, createBdd } from 'playwright-bdd';

export const test = base.extend<{ myFixture: MyFixture }>({
  myFixture: async ({ page }, use) => {
    // ... setup myFixture
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

Playwright-bdd supports scenario-level hook `AfterScenario` (aliased as `After`). It runs **after each scenario**. 

?> Although `After` is more used name, `AfterScenario` better expresses when the hook runs.

Usage:
```ts
import { createBdd } from 'playwright-bdd';

const { AfterScenario } = createBdd();

AfterScenario(async () => {
  // runs after each scenario
});
```

For other options please see [BeforeScenario / Before](#beforescenario-before) section.