# Scenario Hooks

## BeforeScenario / Before

> Consider using [fixtures](writing-steps/hooks/fixtures.md) instead of hooks.

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

> Consider using [fixtures](writing-steps/hooks/fixtures.md) instead of hooks.

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
