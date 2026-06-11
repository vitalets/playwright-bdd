# Worker Hooks

## BeforeWorker / BeforeAll

> Consider using [fixtures](writing-steps/hooks/fixtures.md) instead of hooks.

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

?> If you need to run hook **once for all workers**, check out [Running hook once](writing-steps/hooks/running-hook-once.md).

## AfterWorker / AfterAll

> Consider using [fixtures](writing-steps/hooks/fixtures.md) instead of hooks.

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
